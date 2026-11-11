/**
 * Proceso principal de Electron: ventana, configuración, base de datos e IPC.
 */
import { join } from 'node:path'
import { app, BrowserWindow, dialog, nativeTheme, protocol, screen, shell } from 'electron'
import {
  APP_ID,
  EXTERNAL_PROTOCOLS,
  MAIN_PROCESS_TEXTS,
  MAIN_WINDOW,
  MEDIA_PROTOCOL
} from '@shared/constants'
import { ConfigError, loadAppConfig } from './config/env'
import {
  closeDatabaseConnection,
  configureDatabase,
  ensureDatabaseConnection
} from './database/connection'
import { registerIpcHandlers } from './ipc/registerIpcHandlers'
import { handleMediaRequest } from './services/imageService'
import { applyStoredThemeMode, getAutoDownloadUpdates } from './services/preferencesService'
import { initializeUpdater } from './services/updaterService'

/** URL del servidor de desarrollo que inyecta electron-vite. */
const DEV_SERVER_URL_KEY = 'ELECTRON_RENDERER_URL'

function isExternalUrlAllowed(url: string): boolean {
  try {
    return (EXTERNAL_PROTOCOLS as readonly string[]).includes(new URL(url).protocol)
  } catch {
    return false
  }
}

/** Color de fondo nativo acorde al tema efectivo (evita destellos al cargar o redimensionar). */
const getWindowBackgroundColor = (): string =>
  nativeTheme.shouldUseDarkColors
    ? MAIN_WINDOW.BACKGROUND_COLOR_DARK
    : MAIN_WINDOW.BACKGROUND_COLOR_LIGHT

interface InitialWindowBounds {
  x: number
  y: number
  width: number
  height: number
  /** La pantalla es más chica que el layout: se abre maximizada. */
  maximize: boolean
}

/**
 * Abre la ventana al tamaño del layout, centrada en la pantalla donde está el cursor.
 * Si el layout no cabe en esa pantalla, se abre maximizada.
 */
function getInitialWindowBounds(): InitialWindowBounds {
  const { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  const width = Math.min(MAIN_WINDOW.CONTENT_WIDTH, workArea.width)
  const height = Math.min(MAIN_WINDOW.CONTENT_HEIGHT, workArea.height - MAIN_WINDOW.FRAME_ALLOWANCE)
  return {
    x: Math.round(workArea.x + (workArea.width - width) / 2),
    y: Math.round(workArea.y + (workArea.height - height - MAIN_WINDOW.FRAME_ALLOWANCE) / 2),
    width,
    height,
    maximize:
      workArea.width < MAIN_WINDOW.CONTENT_WIDTH ||
      workArea.height < MAIN_WINDOW.CONTENT_HEIGHT + MAIN_WINDOW.FRAME_ALLOWANCE
  }
}

function createMainWindow(): BrowserWindow {
  const { maximize, ...bounds } = getInitialWindowBounds()
  const window = new BrowserWindow({
    ...bounds,
    // Las medidas se refieren al área de contenido (sin barra de título): el layout recibe 1440×960.
    useContentSize: true,
    minWidth: MAIN_WINDOW.MIN_WIDTH,
    minHeight: MAIN_WINDOW.MIN_HEIGHT,
    backgroundColor: getWindowBackgroundColor(),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  window.once('ready-to-show', () => {
    if (maximize) window.maximize()
    window.show()
  })

  const syncBackgroundColor = () => window.setBackgroundColor(getWindowBackgroundColor())
  nativeTheme.on('updated', syncBackgroundColor)
  window.once('closed', () => nativeTheme.off('updated', syncBackgroundColor))

  // Los enlaces externos (por ejemplo, dentro del Markdown) se abren en el navegador.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternalUrlAllowed(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })
  window.webContents.on('will-navigate', (event, url) => {
    if (url === window.webContents.getURL()) return
    event.preventDefault()
    if (isExternalUrlAllowed(url)) void shell.openExternal(url)
  })

  const devServerUrl = process.env[DEV_SERVER_URL_KEY]
  if (!app.isPackaged && devServerUrl) void window.loadURL(devServerUrl)
  else void window.loadFile(join(__dirname, '../renderer/index.html'))

  return window
}

async function bootstrap(): Promise<void> {
  await applyStoredThemeMode()
  try {
    configureDatabase(loadAppConfig())
  } catch (error) {
    if (error instanceof ConfigError) {
      dialog.showErrorBox(
        MAIN_PROCESS_TEXTS.CONFIG_ERROR_TITLE,
        MAIN_PROCESS_TEXTS.CONFIG_ERROR_BODY(error.missingKeys, error.searchedPaths)
      )
      app.quit()
      return
    }
    throw error
  }

  registerIpcHandlers()
  protocol.handle(MEDIA_PROTOCOL.SCHEME, handleMediaRequest)
  // Se conecta en segundo plano; si falla, cada llamada IPC reintentará.
  ensureDatabaseConnection().catch((error: unknown) =>
    console.error('[database] initial connection failed', error)
  )
  createMainWindow()
  initializeUpdater(await getAutoDownloadUpdates())
}

// El protocolo de imágenes debe declararse antes de que la app esté lista.
protocol.registerSchemesAsPrivileged([
  {
    scheme: MEDIA_PROTOCOL.SCHEME,
    privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true }
  }
])

app.setAppUserModelId(APP_ID)

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const [window] = BrowserWindow.getAllWindows()
    if (!window) return
    if (window.isMinimized()) window.restore()
    window.focus()
  })

  void app.whenReady().then(bootstrap)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })

  app.on('window-all-closed', () => app.quit())
  app.on('before-quit', () => void closeDatabaseConnection())
}
