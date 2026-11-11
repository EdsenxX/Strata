/**
 * Validaciones defensivas de los datos que llegan por IPC.
 * La interfaz no es de confianza: todo se revisa de nuevo aquí.
 */
import { Types, isValidObjectId } from 'mongoose'
import { ERROR_CODES } from '@shared/constants'
import { AppError } from '../errors/AppError'

export function requireObject(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new AppError(ERROR_CODES.VALIDATION_FAILED)
  }
  return value as Record<string, unknown>
}

/** Texto obligatorio, recortado y con longitud máxima. */
export function requireText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') throw new AppError(ERROR_CODES.VALIDATION_FAILED)
  const text = value.trim()
  if (!text || text.length > maxLength) throw new AppError(ERROR_CODES.VALIDATION_FAILED)
  return text
}

/** Texto opcional (puede ser vacío), recortado y con longitud máxima. */
export function optionalText(value: unknown, maxLength: number): string {
  if (value === undefined || value === null) return ''
  if (typeof value !== 'string') throw new AppError(ERROR_CODES.VALIDATION_FAILED)
  const text = value.trim()
  if (text.length > maxLength) throw new AppError(ERROR_CODES.VALIDATION_FAILED)
  return text
}

/** Identificador de MongoDB válido; si no lo es, el recurso no existe. */
export function requireObjectId(value: unknown): Types.ObjectId {
  if (typeof value !== 'string' || !isValidObjectId(value)) {
    throw new AppError(ERROR_CODES.NOT_FOUND)
  }
  return new Types.ObjectId(value)
}

export function requireFound<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new AppError(ERROR_CODES.NOT_FOUND)
  return value
}
