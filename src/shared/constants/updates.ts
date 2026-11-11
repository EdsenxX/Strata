/**
 * Actualizaciones automáticas (electron-updater + GitHub Releases).
 */

/** Estados del ciclo de actualización que el proceso principal comunica a la interfaz. */
export const UPDATE_STATUS = {
  /** Aún no se ha buscado en esta sesión. */
  IDLE: 'idle',
  /** La app no está instalada (modo desarrollo) o el formato no admite actualizaciones. */
  UNSUPPORTED: 'unsupported',
  CHECKING: 'checking',
  UP_TO_DATE: 'up_to_date',
  /** Hay versión nueva y la descarga automática está desactivada. */
  AVAILABLE: 'available',
  DOWNLOADING: 'downloading',
  /** Descargada: se instala al reiniciar (o al cerrar la app). */
  DOWNLOADED: 'downloaded',
  ERROR: 'error'
} as const

export type UpdateStatus = (typeof UPDATE_STATUS)[keyof typeof UPDATE_STATUS]

/** Tiempos de la búsqueda automática (milisegundos). */
export const UPDATE_SCHEDULE = {
  /** Espera tras abrir la app antes de la primera búsqueda. */
  INITIAL_CHECK_DELAY_MS: 10_000,
  /** Intervalo entre búsquedas mientras la app está abierta. */
  CHECK_INTERVAL_MS: 6 * 60 * 60 * 1_000
} as const

/** Valor por defecto de "descargar actualizaciones automáticamente". */
export const DEFAULT_AUTO_DOWNLOAD_UPDATES = true

/** Porcentaje máximo del progreso de descarga. */
export const UPDATE_PROGRESS_MAX = 100
