/**
 * Constantes de seguridad y sesión.
 */

/** Costo del hash bcrypt para contraseñas. */
export const BCRYPT_SALT_ROUNDS = 12

/** Configuración de la sesión persistida localmente (cifrada con safeStorage). */
export const SESSION_CONFIG = {
  FILE_NAME: 'session.bin',
  DURATION_DAYS: 30
} as const

/** Estados de autenticación en la interfaz. */
export const AUTH_STATUS = {
  LOADING: 'loading',
  ANONYMOUS: 'anonymous',
  AUTHENTICATED: 'authenticated'
} as const

export type AuthStatus = (typeof AUTH_STATUS)[keyof typeof AUTH_STATUS]
