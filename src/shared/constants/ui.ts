/**
 * Constantes de comportamiento de la interfaz.
 */

/** Tiempos (milisegundos). */
export const UI_TIMINGS = {
  /** Espera antes de guardar el contenido de una tarea tras dejar de escribir. */
  AUTOSAVE_DEBOUNCE_MS: 800,
  /** Intervalo de refresco del cronómetro en pantalla. */
  TIMER_TICK_MS: 1_000
} as const

/** Direcciones de ordenamiento de tablas. */
export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc'
} as const

export type SortDirection = (typeof SORT_DIRECTIONS)[keyof typeof SORT_DIRECTIONS]

/** Estados del guardado automático del editor. */
export const SAVE_STATUS = {
  IDLE: 'idle',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error'
} as const

export type SaveStatus = (typeof SAVE_STATUS)[keyof typeof SAVE_STATUS]

/** Filtro especial para mostrar tareas de todos los estados. */
export const TASK_FILTER_ALL = 'all'

/** Teclas usadas en atajos. */
export const KEYS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape'
} as const

/** Unidades de tiempo en segundos. */
export const TIME_UNITS = {
  SECONDS_PER_MINUTE: 60,
  SECONDS_PER_HOUR: 3_600,
  MS_PER_SECOND: 1_000
} as const

/** Estados de una carga de datos asíncrona en la interfaz. */
export const ASYNC_STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const

export type AsyncStatus = (typeof ASYNC_STATUS)[keyof typeof ASYNC_STATUS]

/** Redimensionado de imágenes desde sus bordes en el editor. */
export const IMAGE_RESIZE = {
  /** Distancia al borde (px) en la que aparece el cursor de redimensionar. */
  EDGE_THRESHOLD_PX: 12,
  /** Alto mínimo de una imagen (igual que el mínimo de Crepe). */
  MIN_HEIGHT_PX: 100,
  /** Decimales con los que se guarda la proporción en el Markdown. */
  RATIO_DECIMALS: 2
} as const
