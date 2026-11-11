/**
 * Constantes de acceso a datos: variables de entorno, modelos y colecciones de MongoDB.
 */

/** Nombre del archivo de variables de entorno. */
export const ENV_FILE_NAME = '.env'

/** Claves de las variables de entorno requeridas. */
export const ENV_KEYS = {
  MONGODB_URI: 'MONGODB_URI',
  MONGODB_DB_NAME: 'MONGODB_DB_NAME'
} as const

/** Nombres de los modelos de Mongoose. */
export const MODEL_NAMES = {
  USER: 'User',
  ENVIRONMENT: 'Environment',
  PROJECT: 'Project',
  PHASE: 'Phase',
  TASK: 'Task',
  TASK_STATUS: 'TaskStatus',
  TASK_IMAGE: 'TaskImage'
} as const

/** Nombres de las colecciones en MongoDB. */
export const COLLECTION_NAMES = {
  USERS: 'users',
  ENVIRONMENTS: 'environments',
  PROJECTS: 'projects',
  PHASES: 'phases',
  TASKS: 'tasks',
  TASK_STATUSES: 'task_statuses',
  TASK_IMAGES: 'task_images'
} as const

/** Tiempos de espera de la conexión (milisegundos). */
export const DATABASE_TIMEOUTS = {
  SERVER_SELECTION_MS: 10_000
} as const

/** Código de error de MongoDB para llaves duplicadas (índices únicos). */
export const MONGO_DUPLICATE_KEY_CODE = 11000
