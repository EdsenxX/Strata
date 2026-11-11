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
  /** Instalando (en Linux espera la contraseña del sistema); la app se cerrará y volverá a abrir. */
  INSTALLING: 'installing',
  ERROR: 'error'
} as const

export type UpdateStatus = (typeof UPDATE_STATUS)[keyof typeof UPDATE_STATUS]

/** Tiempos de la búsqueda automática (milisegundos). */
export const UPDATE_SCHEDULE = {
  /** Espera tras abrir la app antes de la primera búsqueda. */
  INITIAL_CHECK_DELAY_MS: 10_000,
  /** Intervalo entre búsquedas mientras la app está abierta. */
  CHECK_INTERVAL_MS: 6 * 60 * 60 * 1_000,
  /** Con "actualizar al iniciar": si la búsqueda tarda más que esto, se abre la app normalmente. */
  STARTUP_CHECK_TIMEOUT_MS: 15_000,
  /** Pausa antes de instalar para que la interfaz alcance a mostrar "Instalando…". */
  INSTALL_DELAY_MS: 400
} as const

/** Valor por defecto de "descargar actualizaciones automáticamente". */
export const DEFAULT_AUTO_DOWNLOAD_UPDATES = true

/** Valor por defecto de "actualizar al iniciar". */
export const DEFAULT_INSTALL_UPDATES_ON_STARTUP = false

/** Registro del actualizador en disco (dentro de la carpeta de datos de la app). */
export const UPDATE_LOG = {
  DIRECTORY: 'logs',
  FILE_NAME: 'updater.log',
  /** Al superar este tamaño se reinicia el archivo. */
  MAX_BYTES: 1024 * 1024
} as const

/** Porcentaje máximo del progreso de descarga. */
export const UPDATE_PROGRESS_MAX = 100
