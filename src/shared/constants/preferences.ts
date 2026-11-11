/**
 * Preferencias locales del usuario en este equipo (no se guardan en MongoDB).
 */

/** Modos de tema disponibles. `system` sigue la configuración del sistema operativo. */
export const THEME_MODES = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark'
} as const

export type ThemeMode = (typeof THEME_MODES)[keyof typeof THEME_MODES]

/** Orden en el que se muestran las opciones de tema. */
export const THEME_MODE_VALUES: readonly ThemeMode[] = [
  THEME_MODES.LIGHT,
  THEME_MODES.DARK,
  THEME_MODES.SYSTEM
]

export const DEFAULT_THEME_MODE: ThemeMode = THEME_MODES.SYSTEM

/** Archivo JSON con las preferencias, dentro de la carpeta de datos de la app. */
export const PREFERENCES_FILE_NAME = 'preferences.json'
