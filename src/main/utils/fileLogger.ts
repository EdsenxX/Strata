/**
 * Registro simple en archivo (para diagnosticar procesos que no tienen consola, como el
 * actualizador en la app instalada). Si el archivo supera `maxBytes`, se reinicia.
 */
import { appendFileSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

export interface FileLogger {
  info: (message?: unknown) => void
  warn: (message?: unknown) => void
  error: (message?: unknown) => void
  debug: (message: string) => void
}

const LEVELS = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR', DEBUG: 'DEBUG' } as const

const describe = (message: unknown): string =>
  message instanceof Error ? (message.stack ?? message.message) : String(message)

export function createFileLogger(filePath: string, maxBytes: number): FileLogger {
  const write = (level: string, message: unknown) => {
    try {
      mkdirSync(dirname(filePath), { recursive: true })
      try {
        if (statSync(filePath).size > maxBytes) writeFileSync(filePath, '')
      } catch {
        // El archivo aún no existe.
      }
      // Escritura síncrona: el instalador puede ejecutarse justo antes de cerrar la app.
      appendFileSync(filePath, `${new Date().toISOString()} [${level}] ${describe(message)}\n`)
    } catch {
      // Registrar nunca debe romper la app.
    }
  }
  return {
    info: (message) => write(LEVELS.INFO, message),
    warn: (message) => write(LEVELS.WARN, message),
    error: (message) => write(LEVELS.ERROR, message),
    debug: (message) => write(LEVELS.DEBUG, message)
  }
}
