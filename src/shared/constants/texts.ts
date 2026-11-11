/**
 * Textos visibles para el usuario (español).
 * Toda cadena que aparece en pantalla o en diálogos nativos vive aquí.
 */
import { APP_NAME } from './app'
import { ENV_FILE_NAME, ENV_KEYS } from './database'
import { ERROR_CODES, type ErrorCode } from './errorCodes'
import { THEME_MODES } from './preferences'
import { UPDATE_STATUS, type UpdateStatus } from './updates'
import {
  STATUS_CATEGORIES,
  STATUS_COLORS,
  type StatusCategory,
  type StatusColor
} from './taskStatus'
import { FIELD_LIMITS, PASSWORD_POLICY, PASSWORD_RULE_IDS, type PasswordRuleId } from './validation'

export const COMMON_TEXTS = {
  APP_TAGLINE: 'Tus entornos, proyectos y tareas en capas claras.',
  VERSION_PREFIX: 'v',
  SAVE: 'Guardar',
  CANCEL: 'Cancelar',
  CREATE: 'Crear',
  DELETE: 'Eliminar',
  RENAME: 'Renombrar',
  EDIT: 'Editar',
  BACK: 'Volver',
  LOADING: 'Cargando…',
  RETRY: 'Reintentar',
  CLOSE: 'Cerrar',
  ACTIONS: 'Acciones',
  REQUIRED_MARK: '*',
  REQUIRED_FIELDS_NOTE: 'Campos obligatorios',
  NO_DESCRIPTION: 'Sin descripción'
} as const

export const AUTH_TEXTS = {
  LOGIN_TITLE: 'Iniciar sesión',
  LOGIN_SUBTITLE: 'Bienvenido de vuelta.',
  IDENTIFIER_LABEL: 'Correo o nombre de usuario',
  PASSWORD_LABEL: 'Contraseña',
  PASSWORD_CONFIRMATION_LABEL: 'Confirmar contraseña',
  LOGIN_SUBMIT: 'Entrar',
  NO_ACCOUNT: '¿No tienes cuenta?',
  GO_TO_REGISTER: 'Crear una cuenta',
  REGISTER_TITLE: 'Crear cuenta',
  REGISTER_SUBTITLE: 'Organiza tu trabajo por entornos, proyectos y fases.',
  FIRST_NAMES_LABEL: 'Nombre(s)',
  PATERNAL_LAST_NAME_LABEL: 'Apellido paterno',
  MATERNAL_LAST_NAME_LABEL: 'Apellido materno',
  EMAIL_LABEL: 'Correo electrónico',
  USERNAME_LABEL: 'Nombre de usuario',
  REGISTER_SUBMIT: 'Registrarme',
  HAS_ACCOUNT: '¿Ya tienes cuenta?',
  GO_TO_LOGIN: 'Iniciar sesión',
  LOGOUT: 'Cerrar sesión',
  SHOW_PASSWORD: 'Mostrar contraseña',
  HIDE_PASSWORD: 'Ocultar contraseña',
  PASSWORD_CHECKLIST_TITLE: 'Tu contraseña debe tener:'
} as const

export const PASSWORD_RULE_LABELS: Record<PasswordRuleId, string> = {
  [PASSWORD_RULE_IDS.MIN_LENGTH]: `Al menos ${PASSWORD_POLICY.MIN_LENGTH} caracteres`,
  [PASSWORD_RULE_IDS.UPPERCASE]: 'Una letra mayúscula',
  [PASSWORD_RULE_IDS.LOWERCASE]: 'Una letra minúscula',
  [PASSWORD_RULE_IDS.NUMBER]: 'Un número',
  [PASSWORD_RULE_IDS.SYMBOL]: 'Un símbolo (por ejemplo ! @ # $ %)',
  [PASSWORD_RULE_IDS.NO_SPACES]: 'Sin espacios'
}

export const VALIDATION_TEXTS = {
  REQUIRED: 'Este campo es obligatorio.',
  TOO_LONG: (max: number): string => `Máximo ${max} caracteres.`,
  INVALID_EMAIL: 'Ingresa un correo electrónico válido.',
  INVALID_USERNAME: `Usa de ${FIELD_LIMITS.USERNAME_MIN} a ${FIELD_LIMITS.USERNAME_MAX} caracteres: minúsculas, números, punto, guion o guion bajo.`,
  WEAK_PASSWORD: 'La contraseña no cumple todos los requisitos.',
  PASSWORD_MISMATCH: 'Las contraseñas no coinciden.',
  INVALID_TIME: 'Ingresa un tiempo válido.'
} as const

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.UNAUTHENTICATED]: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Usuario o contraseña incorrectos.',
  [ERROR_CODES.EMAIL_TAKEN]: 'Ese correo ya está registrado.',
  [ERROR_CODES.USERNAME_TAKEN]: 'Ese nombre de usuario ya está en uso.',
  [ERROR_CODES.VALIDATION_FAILED]: 'Revisa los datos ingresados.',
  [ERROR_CODES.NOT_FOUND]: 'No encontramos lo que buscas. Puede que haya sido eliminado.',
  [ERROR_CODES.TIMER_RUNNING]: 'Pausa el cronómetro antes de editar el tiempo.',
  [ERROR_CODES.STATUS_LAST_IN_CATEGORY]:
    'Cada categoría necesita al menos un estado. Crea otro en esa categoría antes de quitar este.',
  [ERROR_CODES.DATABASE_UNAVAILABLE]:
    'No hay conexión con la base de datos. Revisa tu internet y la configuración.',
  [ERROR_CODES.UNKNOWN]: 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}

/** Textos de diálogos nativos que muestra el proceso principal. */
export const MAIN_PROCESS_TEXTS = {
  CONFIG_ERROR_TITLE: `${APP_NAME}: configuración incompleta`,
  CONFIG_ERROR_BODY: (missingKeys: string[], searchedPaths: string[]): string =>
    [
      `Faltan variables de entorno: ${missingKeys.join(', ')}.`,
      '',
      `Crea un archivo ${ENV_FILE_NAME} con ${ENV_KEYS.MONGODB_URI} y ${ENV_KEYS.MONGODB_DB_NAME} en alguna de estas rutas:`,
      ...searchedPaths.map((path) => `• ${path}`)
    ].join('\n')
} as const

export const THEME_TEXTS = {
  LABEL: 'Tema',
  [THEME_MODES.LIGHT]: 'Claro',
  [THEME_MODES.DARK]: 'Oscuro',
  [THEME_MODES.SYSTEM]: 'Sistema'
} as const

export const NAV_TEXTS = {
  ENVIRONMENTS: 'Entornos',
  STATUSES: 'Estados',
  SETTINGS: 'Configuración',
  BREADCRUMB_LABEL: 'Ruta de navegación'
} as const

export const ENVIRONMENT_TEXTS = {
  PAGE_TITLE: 'Entornos',
  PAGE_SUBTITLE: 'Agrupa tus proyectos por cliente, empresa o área de tu vida.',
  NEW: 'Nuevo entorno',
  NAME_LABEL: 'Nombre del entorno',
  NAME_PLACEHOLDER: 'Ej. GGTech, Proyectos personales…',
  CREATE_TITLE: 'Nuevo entorno',
  RENAME_TITLE: 'Renombrar entorno',
  DELETE_TITLE: 'Eliminar entorno',
  DELETE_BODY: (name: string): string =>
    `Se eliminará "${name}" junto con todos sus proyectos, fases y tareas. Esta acción no se puede deshacer.`,
  EMPTY_TITLE: 'Aún no tienes entornos',
  EMPTY_BODY: 'Crea tu primer entorno para empezar a organizar tus proyectos.',
  PROJECT_COUNT: (count: number): string => (count === 1 ? '1 proyecto' : `${count} proyectos`),
  CREATED_AT: 'Creado'
} as const

export const PROJECT_TEXTS = {
  SECTION_TITLE: 'Proyectos',
  NEW: 'Nuevo proyecto',
  NAME_LABEL: 'Nombre del proyecto',
  NAME_PLACEHOLDER: 'Ej. Rediseño del sitio web',
  DESCRIPTION_LABEL: 'Descripción',
  DESCRIPTION_PLACEHOLDER: '¿De qué trata este proyecto?',
  CREATE_TITLE: 'Nuevo proyecto',
  EDIT_TITLE: 'Editar proyecto',
  DELETE_TITLE: 'Eliminar proyecto',
  DELETE_BODY: (name: string): string =>
    `Se eliminará "${name}" junto con todas sus fases y tareas. Esta acción no se puede deshacer.`,
  EMPTY_TITLE: 'Este entorno no tiene proyectos',
  EMPTY_BODY: 'Crea un proyecto para empezar a dividirlo en fases y tareas.',
  COLUMN_NAME: 'Proyecto',
  COLUMN_DESCRIPTION: 'Descripción',
  COLUMN_PROGRESS: 'Avance',
  COLUMN_TIME: 'Tiempo',
  TOTAL_TIME: 'Tiempo total',
  COLUMN_CREATED_AT: 'Creado',
  COLUMN_UPDATED_AT: 'Editado',
  SORT_BY_CREATED_AT: 'Ordenar por fecha de creación',
  PROGRESS: (completed: number, total: number): string => `${completed}/${total} tareas`
} as const

export const PHASE_TEXTS = {
  SECTION_TITLE: 'Fases',
  TOTAL_TIME: 'Tiempo de la fase',
  NEW: 'Nueva fase',
  NAME_LABEL: 'Nombre de la fase',
  NAME_PLACEHOLDER: 'Ej. Descubrimiento, Desarrollo, Lanzamiento…',
  CREATE_TITLE: 'Nueva fase',
  RENAME_TITLE: 'Renombrar fase',
  DELETE_TITLE: 'Eliminar fase',
  DELETE_BODY: (name: string): string =>
    `Se eliminará la fase "${name}" y todas sus tareas. Esta acción no se puede deshacer.`,
  EMPTY_TITLE: 'Este proyecto aún no tiene fases',
  EMPTY_BODY: 'Las fases dividen el proyecto en etapas. Crea la primera para agregar tareas.'
} as const

export const TASK_TEXTS = {
  SECTION_TITLE: 'Tareas',
  NEW_PLACEHOLDER: 'Escribe el título de una nueva tarea y presiona Enter',
  ADD: 'Agregar',
  TITLE_LABEL: 'Título',
  STATUS_LABEL: 'Estado',
  TIME_LABEL: 'Tiempo invertido',
  CONTENT_LABEL: 'Contenido',
  CONTENT_PLACEHOLDER: 'Describe lo que hay que hacer… Escribe "/" para ver bloques.',
  FILTER_ALL: 'Todas',
  EMPTY_TITLE: 'No hay tareas aquí',
  EMPTY_BODY: 'Agrega una tarea con el campo de arriba.',
  EMPTY_FILTER: 'Ninguna tarea coincide con el filtro.',
  START_TIMER: 'Iniciar',
  PAUSE_TIMER: 'Pausar',
  EDIT_TIME: 'Editar tiempo',
  HOURS: 'Horas',
  MINUTES: 'Minutos',
  SECONDS: 'Segundos',
  MANUAL_TIME_TITLE: 'Editar tiempo invertido',
  MANUAL_TIME_HINT: 'Ajusta manualmente el tiempo total registrado en esta tarea.',
  TIMER_RUNNING_HINT: 'Cronómetro en marcha',
  DELETE_TITLE: 'Eliminar tarea',
  DELETE_BODY: (title: string): string =>
    `Se eliminará la tarea "${title}". Esta acción no se puede deshacer.`,
  SAVING: 'Guardando…',
  SAVED: 'Guardado',
  SAVE_ERROR: 'No se pudo guardar',
  CREATED_AT: 'Creada',
  UPDATED_AT: 'Editada'
} as const

export const STATUS_TEXTS = {
  PAGE_TITLE: 'Estados de tareas',
  PAGE_SUBTITLE:
    'Define los estados que usan tus tareas. La categoría decide cómo se comporta cada estado.',
  NEW: 'Nuevo estado',
  CREATE_TITLE: 'Nuevo estado',
  EDIT_TITLE: 'Editar estado',
  NAME_LABEL: 'Nombre',
  NAME_PLACEHOLDER: 'Ej. En revisión, Bloqueada…',
  COLOR_LABEL: 'Color',
  CATEGORY_LABEL: 'Categoría',
  COLUMN_STATUS: 'Estado',
  COLUMN_CATEGORY: 'Categoría',
  COLUMN_TASKS: 'Tareas',
  MOVE_UP: 'Subir',
  MOVE_DOWN: 'Bajar',
  DELETE_TITLE: 'Eliminar estado',
  DELETE_BODY: (name: string, taskCount: number, replacement: string): string =>
    taskCount === 0
      ? `Se eliminará el estado "${name}". Esta acción no se puede deshacer.`
      : `Se eliminará el estado "${name}" y sus ${taskCount} ${taskCount === 1 ? 'tarea pasará' : 'tareas pasarán'} a "${replacement}". Esta acción no se puede deshacer.`,
  LAST_IN_CATEGORY_HINT: 'Es el único estado de su categoría; no se puede eliminar.',
  TASK_COUNT: (count: number): string => (count === 1 ? '1 tarea' : `${count} tareas`)
} as const

export const STATUS_CATEGORY_LABELS: Record<StatusCategory, string> = {
  [STATUS_CATEGORIES.PENDING]: 'Por hacer',
  [STATUS_CATEGORIES.IN_PROGRESS]: 'En curso',
  [STATUS_CATEGORIES.PAUSED]: 'En pausa',
  [STATUS_CATEGORIES.COMPLETED]: 'Terminada'
}

export const STATUS_CATEGORY_HINTS: Record<StatusCategory, string> = {
  [STATUS_CATEGORIES.PENDING]: 'Las tareas nuevas empiezan en el primer estado de esta categoría.',
  [STATUS_CATEGORIES.IN_PROGRESS]: 'Iniciar el cronómetro mueve la tarea aquí.',
  [STATUS_CATEGORIES.PAUSED]: 'Pausar el cronómetro mueve la tarea aquí.',
  [STATUS_CATEGORIES.COMPLETED]: 'Cuenta como terminada en el avance del proyecto.'
}

export const STATUS_COLOR_LABELS: Record<StatusColor, string> = {
  [STATUS_COLORS.GRAY]: 'Gris',
  [STATUS_COLORS.BLUE]: 'Azul',
  [STATUS_COLORS.AMBER]: 'Ámbar',
  [STATUS_COLORS.GREEN]: 'Verde',
  [STATUS_COLORS.VIOLET]: 'Violeta',
  [STATUS_COLORS.TEAL]: 'Turquesa',
  [STATUS_COLORS.PINK]: 'Rosa',
  [STATUS_COLORS.RED]: 'Rojo'
}

/** Etiquetas del editor de bloques (menú "/" y bloques de código). */
export const EDITOR_TEXTS = {
  GROUP_TEXT: 'Texto',
  TEXT: 'Texto',
  HEADING: (level: number): string => `Título ${level}`,
  QUOTE: 'Cita',
  DIVIDER: 'Separador',
  GROUP_LIST: 'Listas',
  BULLET_LIST: 'Lista con viñetas',
  ORDERED_LIST: 'Lista numerada',
  TASK_LIST: 'Lista de pendientes',
  GROUP_ADVANCED: 'Avanzado',
  CODE_BLOCK: 'Bloque de código',
  TABLE: 'Tabla',
  CODE_SEARCH_PLACEHOLDER: 'Buscar lenguaje',
  CODE_NO_RESULTS: 'Sin resultados',
  CODE_COPY: 'Copiar'
} as const

export const SETTINGS_TEXTS = {
  PAGE_TITLE: 'Configuración',
  PAGE_SUBTITLE: 'Preferencias de este equipo.',
  APPEARANCE_TITLE: 'Apariencia',
  APPEARANCE_DESCRIPTION:
    'Elige cómo se ve Strata. "Sistema" sigue la configuración de tu sistema operativo.',
  UPDATES_TITLE: 'Actualizaciones',
  UPDATES_DESCRIPTION: 'Strata busca versiones nuevas al abrirse y cada pocas horas.',
  CURRENT_VERSION: 'Versión instalada',
  AUTO_DOWNLOAD_LABEL: 'Descargar actualizaciones automáticamente',
  AUTO_DOWNLOAD_HINT:
    'Las versiones nuevas se descargan en segundo plano y se instalan al reiniciar o cerrar la app.',
  CHECK_NOW: 'Buscar actualizaciones',
  DOWNLOAD: 'Descargar',
  RESTART_AND_INSTALL: 'Reiniciar e instalar',
  LATER: 'Más tarde',
  LAST_CHECKED: 'Última búsqueda'
} as const

/** Descripción de cada estado de actualización. */
export const UPDATE_STATUS_TEXTS: Record<UpdateStatus, (version: string | null) => string> = {
  [UPDATE_STATUS.IDLE]: () => 'Aún no se han buscado actualizaciones.',
  [UPDATE_STATUS.UNSUPPORTED]: () =>
    'Las actualizaciones solo funcionan en la app instalada (no en modo desarrollo).',
  [UPDATE_STATUS.CHECKING]: () => 'Buscando actualizaciones…',
  [UPDATE_STATUS.UP_TO_DATE]: () => 'Tienes la versión más reciente.',
  [UPDATE_STATUS.AVAILABLE]: (version) => `Hay una versión nueva disponible: v${version}.`,
  [UPDATE_STATUS.DOWNLOADING]: (version) => `Descargando v${version}…`,
  [UPDATE_STATUS.DOWNLOADED]: (version) =>
    `La versión v${version} está lista. Reinicia Strata para instalarla.`,
  [UPDATE_STATUS.ERROR]: () =>
    'No se pudo completar la actualización. Revisa tu conexión e inténtalo de nuevo.'
}

/** Aviso flotante cuando una actualización ya se descargó. */
export const UPDATE_BANNER_TEXTS = {
  TITLE: (version: string): string => `Strata v${version} está lista`,
  BODY: 'Reinicia para instalar la nueva versión.'
} as const
