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
  /**
   * Área de contenido con la que abre la ventana: el alto que necesita el layout más alto
   * (registro y detalle de tarea) para mostrarse sin scroll.
   */
  CONTENT_WIDTH: 1440,
  CONTENT_HEIGHT: 960,
  MIN_WIDTH: 1024,
  MIN_HEIGHT: 640,
  /** Margen para barra de título y paneles del sistema al decidir si la ventana cabe en pantalla. */
  FRAME_ALLOWANCE: 64,
  /** Colores de fondo de la ventana (iguales a --neu-bg) para evitar destellos al cargar. */
  BACKGROUND_COLOR_LIGHT: '#e7ebf1',
  BACKGROUND_COLOR_DARK: '#262a33'
} as const

/** Valores de `process.platform` que la interfaz necesita distinguir. */
export const PLATFORMS = {
  LINUX: 'linux',
  WINDOWS: 'win32'
} as const

/** Protocolos que se permiten abrir en el navegador externo. */
export const EXTERNAL_PROTOCOLS = ['https:', 'http:', 'mailto:'] as const
