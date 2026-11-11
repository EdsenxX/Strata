/**
 * Canales IPC entre la interfaz (renderer) y el proceso principal.
 * Convención: `<dominio>:<acción>`.
 */
export const IPC_CHANNELS = {
  AUTH_REGISTER: 'auth:register',
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_GET_SESSION: 'auth:get-session',

  ENVIRONMENTS_LIST: 'environments:list',
  ENVIRONMENTS_GET: 'environments:get',
  ENVIRONMENTS_CREATE: 'environments:create',
  ENVIRONMENTS_UPDATE: 'environments:update',
  ENVIRONMENTS_DELETE: 'environments:delete',

  PROJECTS_LIST: 'projects:list',
  PROJECTS_GET: 'projects:get',
  PROJECTS_CREATE: 'projects:create',
  PROJECTS_UPDATE: 'projects:update',
  PROJECTS_DELETE: 'projects:delete',

  PHASES_LIST: 'phases:list',
  PHASES_CREATE: 'phases:create',
  PHASES_UPDATE: 'phases:update',
  PHASES_DELETE: 'phases:delete',

  TASKS_LIST: 'tasks:list',
  TASKS_GET: 'tasks:get',
  TASKS_CREATE: 'tasks:create',
  TASKS_UPDATE: 'tasks:update',
  TASKS_DELETE: 'tasks:delete',
  TASKS_START_TIMER: 'tasks:start-timer',
  TASKS_PAUSE_TIMER: 'tasks:pause-timer',
  TASKS_SET_TIME: 'tasks:set-time',

  STATUSES_LIST: 'statuses:list',
  STATUSES_CREATE: 'statuses:create',
  STATUSES_UPDATE: 'statuses:update',
  STATUSES_DELETE: 'statuses:delete',
  STATUSES_REORDER: 'statuses:reorder',

  PREFERENCES_GET_THEME: 'preferences:get-theme',
  PREFERENCES_SET_THEME: 'preferences:set-theme'
} as const

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]

/** Nombre del objeto que el preload expone en `window`. */
export const PRELOAD_API_KEY = 'strata'
