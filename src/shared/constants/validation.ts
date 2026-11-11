/**
 * Reglas de validación compartidas entre el proceso principal y la interfaz.
 */

/** Reglas de contraseña robusta. */
export const PASSWORD_POLICY = {
  MIN_LENGTH: 12,
  MAX_LENGTH: 128
} as const

/** Identificadores de cada regla del checklist de contraseña. */
export const PASSWORD_RULE_IDS = {
  MIN_LENGTH: 'minLength',
  UPPERCASE: 'uppercase',
  LOWERCASE: 'lowercase',
  NUMBER: 'number',
  SYMBOL: 'symbol',
  NO_SPACES: 'noSpaces'
} as const

export type PasswordRuleId = (typeof PASSWORD_RULE_IDS)[keyof typeof PASSWORD_RULE_IDS]

/** Longitudes máximas y mínimas de los campos. */
export const FIELD_LIMITS = {
  PERSON_NAME_MAX: 80,
  EMAIL_MAX: 254,
  USERNAME_MIN: 3,
  USERNAME_MAX: 30,
  ENTITY_NAME_MAX: 80,
  DESCRIPTION_MAX: 500,
  TASK_TITLE_MAX: 160,
  STATUS_NAME_MAX: 40,
  TASK_CONTENT_MAX: 200_000,
  /** Tiempo máximo registrable manualmente en una tarea: 9 999 horas. */
  TASK_TIME_MAX_SECONDS: 9_999 * 3_600
} as const

/** Expresiones regulares reutilizables. */
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-z0-9._-]+$/,
  UPPERCASE: /\p{Lu}/u,
  LOWERCASE: /\p{Ll}/u,
  NUMBER: /\d/,
  SYMBOL: /[^\p{L}\d\s]/u,
  WHITESPACE: /\s/
} as const

/** Nombres de los campos del formulario de registro. */
export const REGISTER_FIELDS = {
  FIRST_NAMES: 'firstNames',
  PATERNAL_LAST_NAME: 'paternalLastName',
  MATERNAL_LAST_NAME: 'maternalLastName',
  EMAIL: 'email',
  USERNAME: 'username',
  PASSWORD: 'password',
  PASSWORD_CONFIRMATION: 'passwordConfirmation'
} as const

export type RegisterField = (typeof REGISTER_FIELDS)[keyof typeof REGISTER_FIELDS]
