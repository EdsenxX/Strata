/**
 * Evaluación de contraseñas robustas. Se usa en el checklist de la interfaz
 * y se vuelve a ejecutar en el proceso principal antes de guardar.
 */
import {
  PASSWORD_POLICY,
  PASSWORD_RULE_IDS,
  PATTERNS,
  type PasswordRuleId
} from '../constants/validation'

export interface PasswordRuleResult {
  id: PasswordRuleId
  passed: boolean
}

const PASSWORD_CHECKS: Record<PasswordRuleId, (password: string) => boolean> = {
  [PASSWORD_RULE_IDS.MIN_LENGTH]: (password) => password.length >= PASSWORD_POLICY.MIN_LENGTH,
  [PASSWORD_RULE_IDS.UPPERCASE]: (password) => PATTERNS.UPPERCASE.test(password),
  [PASSWORD_RULE_IDS.LOWERCASE]: (password) => PATTERNS.LOWERCASE.test(password),
  [PASSWORD_RULE_IDS.NUMBER]: (password) => PATTERNS.NUMBER.test(password),
  [PASSWORD_RULE_IDS.SYMBOL]: (password) => PATTERNS.SYMBOL.test(password),
  [PASSWORD_RULE_IDS.NO_SPACES]: (password) =>
    password.length > 0 && !PATTERNS.WHITESPACE.test(password)
}

/** Devuelve el resultado de cada regla en el orden en que se muestran. */
export function evaluatePassword(password: string): PasswordRuleResult[] {
  return Object.values(PASSWORD_RULE_IDS).map((id) => ({
    id,
    passed: PASSWORD_CHECKS[id](password)
  }))
}

export function isStrongPassword(password: string): boolean {
  return (
    password.length <= PASSWORD_POLICY.MAX_LENGTH &&
    evaluatePassword(password).every((rule) => rule.passed)
  )
}
