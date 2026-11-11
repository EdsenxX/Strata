/**
 * Identidad y configuración general de la aplicación.
 */
export const APP_NAME = 'Strata'

/** Identificador único de la app (debe coincidir con `appId` de electron-builder.yml). */
export const APP_ID = 'global.edsen.strata'

/** Idioma usado para formatear fechas y números en la interfaz. */
export const APP_LOCALE = 'es-MX'

/** Dimensiones de la ventana principal (en píxeles). */
export const MAIN_WINDOW = {
  WIDTH: 1280,
  HEIGHT: 820,
  MIN_WIDTH: 960,
  MIN_HEIGHT: 640,
  /** Colores de fondo de la ventana (iguales a --neu-bg) para evitar destellos al cargar. */
  BACKGROUND_COLOR_LIGHT: '#e7ebf1',
  BACKGROUND_COLOR_DARK: '#262a33'
} as const

/** Protocolos que se permiten abrir en el navegador externo. */
export const EXTERNAL_PROTOCOLS = ['https:', 'http:', 'mailto:'] as const
