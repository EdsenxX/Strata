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
  /** Color de fondo inicial para evitar destellos mientras carga React (tema claro). */
  BACKGROUND_COLOR: '#e7ebf1'
} as const

/** Protocolos que se permiten abrir en el navegador externo. */
export const EXTERNAL_PROTOCOLS = ['https:', 'http:', 'mailto:'] as const
