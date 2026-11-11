/**
 * Actualizaciones automáticas con electron-updater desde GitHub Releases.
 *
 * - Solo funciona en la app instalada (Windows NSIS, .deb y AppImage); en desarrollo el estado es
 *   `unsupported`.
 * - Busca al abrir (tras UPDATE_SCHEDULE.INITIAL_CHECK_DELAY_MS) y luego cada CHECK_INTERVAL_MS.
 * - Si la descarga automática está activa, descarga en segundo plano; la actualización se instala al
 *   reiniciar desde la interfaz o al cerrar la app (`autoInstallOnAppQuit`).
 * - Cada cambio de estado se envía a todas las ventanas por IPC_EVENTS.UPDATES_STATE_CHANGED.
 */
import { app, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import {
  IPC_EVENTS,
  UPDATE_PROGRESS_MAX,
  UPDATE_SCHEDULE,
  UPDATE_STATUS,
  type UpdateStatus
} from '@shared/constants'
import type { UpdateState } from '@shared/types'

/** Estados en los que no tiene sentido volver a buscar. */
const BUSY_STATUSES: readonly UpdateStatus[] = [
  UPDATE_STATUS.CHECKING,
  UPDATE_STATUS.DOWNLOADING,
  UPDATE_STATUS.DOWNLOADED
]

let state: UpdateState = {
  status: UPDATE_STATUS.IDLE,
  currentVersion: app.getVersion(),
  availableVersion: null,
  progress: 0,
  lastCheckedAt: null
}

let initialized = false

function setState(patch: Partial<UpdateState>): UpdateState {
  state = { ...state, ...patch }
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send(IPC_EVENTS.UPDATES_STATE_CHANGED, state)
  }
  return state
}

const checkedNow = (): string => new Date().toISOString()

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
  autoUpdater.on('update-not-available', () =>
    setState({
      status: UPDATE_STATUS.UP_TO_DATE,
      availableVersion: null,
      lastCheckedAt: checkedNow()
    })
  )
  autoUpdater.on('download-progress', (progress) =>
    setState({ status: UPDATE_STATUS.DOWNLOADING, progress: Math.floor(progress.percent) })
  )
  autoUpdater.on('update-downloaded', (info) =>
    setState({
      status: UPDATE_STATUS.DOWNLOADED,
      availableVersion: info.version,
      progress: UPDATE_PROGRESS_MAX
    })
  )
  autoUpdater.on('error', (error) => {
    console.error('[updater]', error)
    setState({ status: UPDATE_STATUS.ERROR, lastCheckedAt: checkedNow() })
  })
}

/** Prepara el actualizador y programa las búsquedas automáticas. */
export function initializeUpdater(autoDownload: boolean): void {
  if (initialized) return
  initialized = true
  if (!app.isPackaged) {
    setState({ status: UPDATE_STATUS.UNSUPPORTED })
    return
  }
  autoUpdater.autoDownload = autoDownload
  autoUpdater.autoInstallOnAppQuit = true
  registerUpdaterEvents()
  setTimeout(() => void checkForUpdates(), UPDATE_SCHEDULE.INITIAL_CHECK_DELAY_MS)
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
    if (result === null) return setState({ status: UPDATE_STATUS.UNSUPPORTED })
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

/** Cierra la app, instala la actualización descargada y vuelve a abrirla. */
export async function installUpdate(): Promise<null> {
  if (state.status === UPDATE_STATUS.DOWNLOADED) {
    setImmediate(() => autoUpdater.quitAndInstall(true, true))
  }
  return null
}

/** Aplica el cambio de preferencia; si ya había una versión esperando, empieza a descargarla. */
export function setAutoDownload(value: boolean): void {
  if (!initialized || state.status === UPDATE_STATUS.UNSUPPORTED) return
  autoUpdater.autoDownload = value
  if (value) void downloadUpdate()
}
