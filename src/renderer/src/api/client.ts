/**
 * Cliente de la API del proceso principal (expuesta por el preload en `window.strata`).
 */
import { ERROR_CODES, ERROR_MESSAGES, type ErrorCode } from '@shared/constants'
import type { ApiResult } from '@shared/types'

export const api = window.strata

export class ApiError extends Error {
  constructor(readonly code: ErrorCode) {
    super(code)
    this.name = 'ApiError'
  }
}

type Listener = () => void
let unauthenticatedListener: Listener | null = null

/** Permite al store de sesión reaccionar cuando el proceso principal rechaza la sesión. */
export function onUnauthenticated(listener: Listener): void {
  unauthenticatedListener = listener
}

/** Convierte un `ApiResult` en el dato o lanza `ApiError`. */
export async function unwrap<T>(request: Promise<ApiResult<T>>): Promise<T> {
  const result = await request
  if (result.ok) return result.data
  if (result.error === ERROR_CODES.UNAUTHENTICATED) unauthenticatedListener?.()
  throw new ApiError(result.error)
}

export function getErrorMessage(error: unknown): string {
  const code = error instanceof ApiError ? error.code : ERROR_CODES.UNKNOWN
  return ERROR_MESSAGES[code]
}

export function isApiError(error: unknown, code: ErrorCode): boolean {
  return error instanceof ApiError && error.code === code
}
