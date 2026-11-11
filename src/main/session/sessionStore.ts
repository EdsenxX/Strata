/**
 * Sesión del usuario en el proceso principal.
 *
 * El id del usuario vive en memoria; además se persiste cifrado con `safeStorage`
 * (llavero del sistema operativo) para no pedir login en cada arranque.
 * Si el sistema no ofrece cifrado real, la sesión solo dura mientras la app esté abierta.
 */
import { readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { app, safeStorage } from 'electron'
import { Types } from 'mongoose'
import { ERROR_CODES, SESSION_CONFIG } from '@shared/constants'
import { AppError } from '../errors/AppError'

const LINUX_PLATFORM = 'linux'
const INSECURE_LINUX_BACKEND = 'basic_text'
const MS_PER_DAY = 86_400_000

interface PersistedSession {
  userId: string
  expiresAt: number
}

let currentUserId: string | null = null

const sessionFilePath = (): string => join(app.getPath('userData'), SESSION_CONFIG.FILE_NAME)

async function canPersistSession(): Promise<boolean> {
  if (!(await safeStorage.isAsyncEncryptionAvailable())) return false
  if (process.platform !== LINUX_PLATFORM) return true
  return safeStorage.getSelectedStorageBackend() !== INSECURE_LINUX_BACKEND
}

/** Id del usuario autenticado; lanza UNAUTHENTICATED si no hay sesión. */
export function requireUserId(): Types.ObjectId {
  if (!currentUserId) throw new AppError(ERROR_CODES.UNAUTHENTICATED)
  return new Types.ObjectId(currentUserId)
}

export async function startSession(userId: string): Promise<void> {
  currentUserId = userId
  if (!(await canPersistSession())) return
  const session: PersistedSession = {
    userId,
    expiresAt: Date.now() + SESSION_CONFIG.DURATION_DAYS * MS_PER_DAY
  }
  await writeFile(sessionFilePath(), await safeStorage.encryptStringAsync(JSON.stringify(session)))
}

export async function endSession(): Promise<void> {
  currentUserId = null
  await rm(sessionFilePath(), { force: true })
}

/** Recupera la sesión persistida (si existe y no ha expirado). */
export async function restoreSession(): Promise<string | null> {
  if (currentUserId) return currentUserId
  if (!(await canPersistSession())) return null
  try {
    const encrypted = await readFile(sessionFilePath())
    const { result } = await safeStorage.decryptStringAsync(encrypted)
    const session = JSON.parse(result) as PersistedSession
    if (session.expiresAt < Date.now()) {
      await endSession()
      return null
    }
    currentUserId = session.userId
    return currentUserId
  } catch {
    // Archivo inexistente o corrupto: se trata como "sin sesión".
    return null
  }
}
