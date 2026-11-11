/**
 * Proceso principal de Electron: ventana, configuración, base de datos e IPC.
 */
import { join } from 'node:path'
import { app, BrowserWindow, dialog, shell } from 'electron'
import { APP_ID, EXTERNAL_PROTOCOLS, MAIN_PROCESS_TEXTS, MAIN_WINDOW } from '@shared/constants'
import { ConfigError, loadAppConfig } from './config/env'
import {
  closeDatabaseConnection,
  configureDatabase,
  ensureDatabaseConnection
} from './database/connection'
import { registerIpcHandlers } from './ipc/registerIpcHandlers'

/** URL del servidor de desarrollo que inyecta electron-vite. */
const DEV_SERVER_URL_KEY = 'ELECTRON_RENDERER_URL'

function isExternalUrlAllowed(url: string): boolean {
  try {
    return (EXTERNAL_PROTOCOLS as readonly string[]).includes(new URL(url).protocol)
  } catch {
    return false
  }
}

function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: MAIN_WINDOW.WIDTH,
    height: MAIN_WINDOW.HEIGHT,
    minWidth: MAIN_WINDOW.MIN_WIDTH,
    minHeight: MAIN_WINDOW.MIN_HEIGHT,
    backgroundColor: MAIN_WINDOW.BACKGROUND_COLOR,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  window.once('ready-to-show', () => window.show())

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
  // Se conecta en segundo plano; si falla, cada llamada IPC reintentará.
  ensureDatabaseConnection().catch((error: unknown) =>
    console.error('[database] initial connection failed', error)
  )
  createMainWindow()
}

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
