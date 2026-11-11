/**
 * Validación del formulario de registro, compartida por interfaz y proceso principal.
 */
import {
  FIELD_LIMITS,
  PATTERNS,
  REGISTER_FIELDS,
  type RegisterField
} from '../constants/validation'
import { VALIDATION_TEXTS } from '../constants/texts'
import type { RegisterInput } from '../types/inputs'
import { isStrongPassword } from './password'

export type RegisterErrors = Partial<Record<RegisterField, string>>

/** Normaliza los datos antes de validar o guardar. */
export function normalizeRegisterInput(input: RegisterInput): RegisterInput {
  return {
    firstNames: input.firstNames.trim(),
    paternalLastName: input.paternalLastName.trim(),
    maternalLastName: input.maternalLastName.trim(),
    email: input.email.trim().toLowerCase(),
    username: input.username.trim().toLowerCase(),
    password: input.password,
    passwordConfirmation: input.passwordConfirmation
  }
}

function validatePersonName(value: string): string | undefined {
  if (!value) return VALIDATION_TEXTS.REQUIRED
  if (value.length > FIELD_LIMITS.PERSON_NAME_MAX) {
    return VALIDATION_TEXTS.TOO_LONG(FIELD_LIMITS.PERSON_NAME_MAX)
  }
  return undefined
}

/** Devuelve un objeto con el error de cada campo inválido (vacío si todo es válido). */
export function validateRegistration(rawInput: RegisterInput): RegisterErrors {
  const input = normalizeRegisterInput(rawInput)
  const errors: RegisterErrors = {
    [REGISTER_FIELDS.FIRST_NAMES]: validatePersonName(input.firstNames),
    [REGISTER_FIELDS.PATERNAL_LAST_NAME]: validatePersonName(input.paternalLastName),
    [REGISTER_FIELDS.MATERNAL_LAST_NAME]: validatePersonName(input.maternalLastName)
  }

  if (!input.email) errors.email = VALIDATION_TEXTS.REQUIRED
  else if (input.email.length > FIELD_LIMITS.EMAIL_MAX || !PATTERNS.EMAIL.test(input.email)) {
    errors.email = VALIDATION_TEXTS.INVALID_EMAIL
  }

  if (!input.username) errors.username = VALIDATION_TEXTS.REQUIRED
  else if (
    input.username.length < FIELD_LIMITS.USERNAME_MIN ||
    input.username.length > FIELD_LIMITS.USERNAME_MAX ||
    !PATTERNS.USERNAME.test(input.username)
  ) {
    errors.username = VALIDATION_TEXTS.INVALID_USERNAME
  }

  if (!input.password) errors.password = VALIDATION_TEXTS.REQUIRED
  else if (!isStrongPassword(input.password)) errors.password = VALIDATION_TEXTS.WEAK_PASSWORD

  if (input.password !== input.passwordConfirmation) {
    errors.passwordConfirmation = VALIDATION_TEXTS.PASSWORD_MISMATCH
  }

  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message !== undefined)
  ) as RegisterErrors
}

export function hasErrors(errors: RegisterErrors): boolean {
  return Object.keys(errors).length > 0
}
