/**
 * Registro de todos los manejadores IPC.
 *
 * Cada manejador:
 * 1. Garantiza la conexión a la base de datos (salvo los que no la necesitan).
 * 2. Ejecuta el servicio correspondiente.
 * 3. Devuelve un `ApiResult` (nunca propaga excepciones a la interfaz).
 */
import { ipcMain } from 'electron'
import { ERROR_CODES, IPC_CHANNELS, type IpcChannel } from '@shared/constants'
import type { ApiResult } from '@shared/types'
import { ensureDatabaseConnection } from '../database/connection'
import { AppError } from '../errors/AppError'
import * as authService from '../services/authService'
import * as environmentService from '../services/environmentService'
import * as imageService from '../services/imageService'
import * as phaseService from '../services/phaseService'
import * as preferencesService from '../services/preferencesService'
import * as projectService from '../services/projectService'
import * as statusService from '../services/statusService'
import * as updaterService from '../services/updaterService'
import * as taskService from '../services/taskService'

type Handler<T> = (input: unknown) => Promise<T>

interface HandleOptions {
  /** `false` para operaciones locales que no tocan MongoDB (por ejemplo, preferencias). */
  requiresDatabase?: boolean
}

function handle<T>(
  channel: IpcChannel,
  handler: Handler<T>,
  { requiresDatabase = true }: HandleOptions = {}
): void {
  ipcMain.handle(channel, async (_event, input: unknown): Promise<ApiResult<T>> => {
    if (requiresDatabase) {
      try {
        await ensureDatabaseConnection()
      } catch (error) {
        console.error(`[ipc:${channel}] database connection failed`, error)
        return { ok: false, error: ERROR_CODES.DATABASE_UNAVAILABLE }
      }
    }
    try {
      return { ok: true, data: await handler(input) }
    } catch (error) {
      if (error instanceof AppError) return { ok: false, error: error.code }
      console.error(`[ipc:${channel}] unexpected error`, error)
      return { ok: false, error: ERROR_CODES.UNKNOWN }
    }
  })
}

export function registerIpcHandlers(): void {
  handle(IPC_CHANNELS.AUTH_REGISTER, authService.register)
  handle(IPC_CHANNELS.AUTH_LOGIN, authService.login)
  handle(IPC_CHANNELS.AUTH_LOGOUT, authService.logout)
  handle(IPC_CHANNELS.AUTH_GET_SESSION, authService.getSession)

  handle(IPC_CHANNELS.ENVIRONMENTS_LIST, environmentService.listEnvironments)
  handle(IPC_CHANNELS.ENVIRONMENTS_GET, environmentService.getEnvironment)
  handle(IPC_CHANNELS.ENVIRONMENTS_CREATE, environmentService.createEnvironment)
  handle(IPC_CHANNELS.ENVIRONMENTS_UPDATE, environmentService.updateEnvironment)
  handle(IPC_CHANNELS.ENVIRONMENTS_DELETE, environmentService.deleteEnvironment)

  handle(IPC_CHANNELS.PROJECTS_LIST, projectService.listProjects)
  handle(IPC_CHANNELS.PROJECTS_GET, projectService.getProject)
  handle(IPC_CHANNELS.PROJECTS_CREATE, projectService.createProject)
  handle(IPC_CHANNELS.PROJECTS_UPDATE, projectService.updateProject)
  handle(IPC_CHANNELS.PROJECTS_DELETE, projectService.deleteProject)

  handle(IPC_CHANNELS.PHASES_LIST, phaseService.listPhases)
  handle(IPC_CHANNELS.PHASES_CREATE, phaseService.createPhase)
  handle(IPC_CHANNELS.PHASES_UPDATE, phaseService.updatePhase)
  handle(IPC_CHANNELS.PHASES_DELETE, phaseService.deletePhase)

  handle(IPC_CHANNELS.TASKS_LIST, taskService.listTasks)
  handle(IPC_CHANNELS.TASKS_GET, taskService.getTask)
  handle(IPC_CHANNELS.TASKS_CREATE, taskService.createTask)
  handle(IPC_CHANNELS.TASKS_UPDATE, taskService.updateTask)
  handle(IPC_CHANNELS.TASKS_DELETE, taskService.deleteTask)
  handle(IPC_CHANNELS.TASKS_START_TIMER, taskService.startTaskTimer)
  handle(IPC_CHANNELS.TASKS_PAUSE_TIMER, taskService.pauseTaskTimer)
  handle(IPC_CHANNELS.TASKS_SET_TIME, taskService.setTaskTime)

  handle(IPC_CHANNELS.IMAGES_UPLOAD, imageService.uploadImage)

  handle(IPC_CHANNELS.STATUSES_LIST, statusService.listStatuses)
  handle(IPC_CHANNELS.STATUSES_CREATE, statusService.createStatus)
  handle(IPC_CHANNELS.STATUSES_UPDATE, statusService.updateStatus)
  handle(IPC_CHANNELS.STATUSES_DELETE, statusService.deleteStatus)
  handle(IPC_CHANNELS.STATUSES_REORDER, statusService.reorderStatuses)

  const local = { requiresDatabase: false }
  handle(IPC_CHANNELS.PREFERENCES_GET_THEME, preferencesService.getThemeMode, local)
  handle(IPC_CHANNELS.PREFERENCES_SET_THEME, preferencesService.setThemeMode, local)
  handle(
    IPC_CHANNELS.PREFERENCES_GET_AUTO_DOWNLOAD_UPDATES,
    preferencesService.getAutoDownloadUpdates,
    local
  )
  handle(
    IPC_CHANNELS.PREFERENCES_SET_AUTO_DOWNLOAD_UPDATES,
    preferencesService.setAutoDownloadUpdates,
    local
  )

  handle(IPC_CHANNELS.UPDATES_GET_STATE, updaterService.getUpdateState, local)
  handle(IPC_CHANNELS.UPDATES_CHECK, updaterService.checkForUpdates, local)
  handle(IPC_CHANNELS.UPDATES_DOWNLOAD, updaterService.downloadUpdate, local)
  handle(IPC_CHANNELS.UPDATES_INSTALL, updaterService.installUpdate, local)
}
