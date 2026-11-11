/**
 * Preload: expone una API mínima y tipada en `window.strata`.
 * La interfaz nunca accede a Node ni a ipcRenderer directamente.
 */
import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS, PRELOAD_API_KEY, type IpcChannel } from '@shared/constants'
import type { StrataApi } from '@shared/types'

const invoke =
  (channel: IpcChannel) =>
  (input?: unknown): Promise<never> =>
    ipcRenderer.invoke(channel, input) as Promise<never>

const api: StrataApi = {
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
  preferences: {
    getTheme: invoke(IPC_CHANNELS.PREFERENCES_GET_THEME),
    setTheme: invoke(IPC_CHANNELS.PREFERENCES_SET_THEME)
  }
}

contextBridge.exposeInMainWorld(PRELOAD_API_KEY, api)
