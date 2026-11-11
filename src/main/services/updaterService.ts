/**
 * Actualizaciones automáticas con electron-updater desde GitHub Releases.
 *
 * - Solo funciona en la app instalada (Windows NSIS, .deb y AppImage); en desarrollo el estado es
 *   `unsupported`.
 * - Busca al abrir (tras UPDATE_SCHEDULE.INITIAL_CHECK_DELAY_MS) y luego cada CHECK_INTERVAL_MS.
 * - Con "descargar automáticamente" descarga en segundo plano; se instala con "Actualizar ahora" o al
 *   cerrar la app (`autoInstallOnAppQuit`).
 * - Con "actualizar al iniciar" busca de inmediato al abrir; si hay versión nueva la descarga y la
 *   instala antes de empezar (la interfaz muestra una pantalla que permite omitirlo).
 * - En Linux (.deb) instalar pide la contraseña del sistema. Si falla o se cancela, la versión sigue
 *   descargada (`installFailed`) para reintentar; no se confunde con un error de conexión.
 * - Todo el proceso queda registrado en `userData/logs/updater.log`.
 */
import { join } from 'node:path'
import { app, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import {
  IPC_EVENTS,
  UPDATE_LOG,
  UPDATE_PROGRESS_MAX,
  UPDATE_SCHEDULE,
  UPDATE_STATUS,
  type UpdateStatus
} from '@shared/constants'
import type { UpdateState } from '@shared/types'
import { createFileLogger } from '../utils/fileLogger'

export interface UpdaterOptions {
  autoDownload: boolean
  installOnStartup: boolean
}

/** Estados en los que no tiene sentido volver a buscar. */
const BUSY_STATUSES: readonly UpdateStatus[] = [
  UPDATE_STATUS.CHECKING,
  UPDATE_STATUS.DOWNLOADING,
  UPDATE_STATUS.DOWNLOADED,
  UPDATE_STATUS.INSTALLING
]

let state: UpdateState = {
  status: UPDATE_STATUS.IDLE,
  currentVersion: app.getVersion(),
  availableVersion: null,
  progress: 0,
  lastCheckedAt: null,
  startupInstall: false,
  installFailed: false
}

let initialized = false
/** Preferencia del usuario (la actualización al iniciar descarga aunque esté desactivada). */
let preferredAutoDownload = true

function setState(patch: Partial<UpdateState>): UpdateState {
  state = { ...state, ...patch }
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send(IPC_EVENTS.UPDATES_STATE_CHANGED, state)
  }
  return state
}

const checkedNow = (): string => new Date().toISOString()

/** Termina el modo "actualizar al iniciar" y restaura la preferencia de descarga. */
function endStartupInstall(): void {
  if (!state.startupInstall) return
  autoUpdater.autoDownload = preferredAutoDownload
  setState({ startupInstall: false })
}

function registerUpdaterEvents(): void {
  autoUpdater.on('checking-for-update', () => setState({ status: UPDATE_STATUS.CHECKING }))
  autoUpdater.on('update-available', (info) =>
    setState({
      // Con descarga automática, electron-updater empieza a descargar en cuanto la encuentra.
      status: autoUpdater.autoDownload ? UPDATE_STATUS.DOWNLOADING : UPDATE_STATUS.AVAILABLE,
      availableVersion: info.version,
      progress: 0,
      lastCheckedAt: checkedNow()
    })
  )
  autoUpdater.on('update-not-available', () => {
    setState({
      status: UPDATE_STATUS.UP_TO_DATE,
      availableVersion: null,
      lastCheckedAt: checkedNow()
    })
    endStartupInstall()
  })
  autoUpdater.on('download-progress', (progress) =>
    setState({ status: UPDATE_STATUS.DOWNLOADING, progress: Math.floor(progress.percent) })
  )
  autoUpdater.on('update-downloaded', (info) => {
    setState({
      status: UPDATE_STATUS.DOWNLOADED,
      availableVersion: info.version,
      progress: UPDATE_PROGRESS_MAX,
      installFailed: false
    })
    if (state.startupInstall) void installUpdate()
  })
  autoUpdater.on('error', (error) => {
    autoUpdater.logger?.error(error)
    if (state.status === UPDATE_STATUS.INSTALLING) {
      // La descarga sigue válida: se puede reintentar o se instalará al cerrar la app.
      setState({ status: UPDATE_STATUS.DOWNLOADED, installFailed: true })
    } else {
      setState({ status: UPDATE_STATUS.ERROR, lastCheckedAt: checkedNow() })
    }
    endStartupInstall()
  })
}

/** Prepara el actualizador y programa las búsquedas automáticas. */
export function initializeUpdater({ autoDownload, installOnStartup }: UpdaterOptions): void {
  if (initialized) return
  initialized = true
  if (!app.isPackaged) {
    setState({ status: UPDATE_STATUS.UNSUPPORTED })
    return
  }
  autoUpdater.logger = createFileLogger(
    join(app.getPath('userData'), UPDATE_LOG.DIRECTORY, UPDATE_LOG.FILE_NAME),
    UPDATE_LOG.MAX_BYTES
  )
  preferredAutoDownload = autoDownload
  autoUpdater.autoDownload = autoDownload
  autoUpdater.autoInstallOnAppQuit = true
  registerUpdaterEvents()

  if (installOnStartup) {
    autoUpdater.autoDownload = true
    setState({ startupInstall: true })
    void checkForUpdates()
    // Si la búsqueda se alarga (red lenta), la app se abre normalmente.
    setTimeout(() => {
      if (state.status === UPDATE_STATUS.CHECKING || state.status === UPDATE_STATUS.IDLE) {
        endStartupInstall()
      }
    }, UPDATE_SCHEDULE.STARTUP_CHECK_TIMEOUT_MS)
  } else {
    setTimeout(() => void checkForUpdates(), UPDATE_SCHEDULE.INITIAL_CHECK_DELAY_MS)
  }
  setInterval(() => void checkForUpdates(), UPDATE_SCHEDULE.CHECK_INTERVAL_MS)
}

export function getUpdateState(): Promise<UpdateState> {
  return Promise.resolve(state)
}

export async function checkForUpdates(): Promise<UpdateState> {
  if (state.status === UPDATE_STATUS.UNSUPPORTED || BUSY_STATUSES.includes(state.status)) {
    return state
  }
  try {
    // Devuelve null si el formato instalado no admite actualizaciones (p. ej. sin APPIMAGE).
    const result = await autoUpdater.checkForUpdates()
    if (result === null) {
      setState({ status: UPDATE_STATUS.UNSUPPORTED })
      endStartupInstall()
    }
  } catch {
    // El evento 'error' ya actualizó el estado.
  }
  return state
}

/** Descarga manual (cuando la descarga automática está desactivada). */
export async function downloadUpdate(): Promise<UpdateState> {
  if (state.status !== UPDATE_STATUS.AVAILABLE) return state
  setState({ status: UPDATE_STATUS.DOWNLOADING, progress: 0 })
  autoUpdater.downloadUpdate().catch(() => {
    // El evento 'error' ya actualizó el estado.
  })
  return state
}

/**
 * Cierra la app, instala la actualización descargada y vuelve a abrirla.
 * La instalación es síncrona (en Linux espera la contraseña), por eso primero se publica
 * el estado "Instalando" y se deja un momento para que la interfaz lo muestre.
 */
export async function installUpdate(): Promise<null> {
  if (state.status !== UPDATE_STATUS.DOWNLOADED) return null
  setState({ status: UPDATE_STATUS.INSTALLING, installFailed: false })
  // Si falla, electron-updater emite 'error' de forma síncrona y el manejador marca `installFailed`.
  // Si funciona, la app se cierra y se vuelve a abrir ya actualizada.
  setTimeout(() => autoUpdater.quitAndInstall(true, true), UPDATE_SCHEDULE.INSTALL_DELAY_MS)
  return null
}

/** Omite la actualización al iniciar; si ya se estaba descargando, termina en segundo plano. */
export async function skipStartupInstall(): Promise<UpdateState> {
  endStartupInstall()
  return state
}

/** Aplica el cambio de preferencia; si ya había una versión esperando, empieza a descargarla. */
export function setAutoDownload(value: boolean): void {
  preferredAutoDownload = value
  if (!initialized || state.status === UPDATE_STATUS.UNSUPPORTED) return
  if (!state.startupInstall) autoUpdater.autoDownload = value
  if (value) void downloadUpdate()
}
