/**
 * Preload: expone una API mínima y tipada en `window.strata`.
 * La interfaz nunca accede a Node ni a ipcRenderer directamente.
 */
import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS, IPC_EVENTS, PRELOAD_API_KEY, type IpcChannel } from '@shared/constants'
import type { StrataApi, UpdateState } from '@shared/types'

const invoke =
  (channel: IpcChannel) =>
  (input?: unknown): Promise<never> =>
    ipcRenderer.invoke(channel, input) as Promise<never>

const api: StrataApi = {
  platform: process.platform,
  auth: {
    register: invoke(IPC_CHANNELS.AUTH_REGISTER),
    login: invoke(IPC_CHANNELS.AUTH_LOGIN),
    logout: invoke(IPC_CHANNELS.AUTH_LOGOUT),
    getSession: invoke(IPC_CHANNELS.AUTH_GET_SESSION)
  },
  environments: {
    list: invoke(IPC_CHANNELS.ENVIRONMENTS_LIST),
    get: invoke(IPC_CHANNELS.ENVIRONMENTS_GET),
    create: invoke(IPC_CHANNELS.ENVIRONMENTS_CREATE),
    update: invoke(IPC_CHANNELS.ENVIRONMENTS_UPDATE),
    remove: invoke(IPC_CHANNELS.ENVIRONMENTS_DELETE)
  },
  projects: {
    list: invoke(IPC_CHANNELS.PROJECTS_LIST),
    get: invoke(IPC_CHANNELS.PROJECTS_GET),
    create: invoke(IPC_CHANNELS.PROJECTS_CREATE),
    update: invoke(IPC_CHANNELS.PROJECTS_UPDATE),
    remove: invoke(IPC_CHANNELS.PROJECTS_DELETE)
  },
  phases: {
    list: invoke(IPC_CHANNELS.PHASES_LIST),
    create: invoke(IPC_CHANNELS.PHASES_CREATE),
    update: invoke(IPC_CHANNELS.PHASES_UPDATE),
    remove: invoke(IPC_CHANNELS.PHASES_DELETE)
  },
  tasks: {
    list: invoke(IPC_CHANNELS.TASKS_LIST),
    get: invoke(IPC_CHANNELS.TASKS_GET),
    create: invoke(IPC_CHANNELS.TASKS_CREATE),
    update: invoke(IPC_CHANNELS.TASKS_UPDATE),
    remove: invoke(IPC_CHANNELS.TASKS_DELETE),
    startTimer: invoke(IPC_CHANNELS.TASKS_START_TIMER),
    pauseTimer: invoke(IPC_CHANNELS.TASKS_PAUSE_TIMER),
    setTime: invoke(IPC_CHANNELS.TASKS_SET_TIME)
  },
  images: {
    upload: invoke(IPC_CHANNELS.IMAGES_UPLOAD)
  },
  statuses: {
    list: invoke(IPC_CHANNELS.STATUSES_LIST),
    create: invoke(IPC_CHANNELS.STATUSES_CREATE),
    update: invoke(IPC_CHANNELS.STATUSES_UPDATE),
    remove: invoke(IPC_CHANNELS.STATUSES_DELETE),
    reorder: invoke(IPC_CHANNELS.STATUSES_REORDER)
  },
  preferences: {
    getTheme: invoke(IPC_CHANNELS.PREFERENCES_GET_THEME),
    setTheme: invoke(IPC_CHANNELS.PREFERENCES_SET_THEME),
    getAutoDownloadUpdates: invoke(IPC_CHANNELS.PREFERENCES_GET_AUTO_DOWNLOAD_UPDATES),
    setAutoDownloadUpdates: invoke(IPC_CHANNELS.PREFERENCES_SET_AUTO_DOWNLOAD_UPDATES),
    getInstallOnStartup: invoke(IPC_CHANNELS.PREFERENCES_GET_INSTALL_ON_STARTUP),
    setInstallOnStartup: invoke(IPC_CHANNELS.PREFERENCES_SET_INSTALL_ON_STARTUP)
  },
  updates: {
    getState: invoke(IPC_CHANNELS.UPDATES_GET_STATE),
    check: invoke(IPC_CHANNELS.UPDATES_CHECK),
    download: invoke(IPC_CHANNELS.UPDATES_DOWNLOAD),
    install: invoke(IPC_CHANNELS.UPDATES_INSTALL),
    skipStartup: invoke(IPC_CHANNELS.UPDATES_SKIP_STARTUP),
    onStateChange: (listener) => {
      const handler = (_event: Electron.IpcRendererEvent, state: UpdateState) => listener(state)
      ipcRenderer.on(IPC_EVENTS.UPDATES_STATE_CHANGED, handler)
      return () => ipcRenderer.removeListener(IPC_EVENTS.UPDATES_STATE_CHANGED, handler)
    }
  }
}

contextBridge.exposeInMainWorld(PRELOAD_API_KEY, api)
