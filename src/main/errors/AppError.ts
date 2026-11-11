/**
 * Error de dominio con un código conocido por la interfaz.
 */
import type { ErrorCode } from '@shared/constants'

export class AppError extends Error {
  constructor(readonly code: ErrorCode) {
    super(code)
    this.name = 'AppError'
  }
}
