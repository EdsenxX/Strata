/**
 * Conexión única a MongoDB mediante Mongoose.
 * La conexión se inicia al arrancar y se reintenta bajo demanda si falló.
 */
import mongoose from 'mongoose'
import { DATABASE_TIMEOUTS } from '@shared/constants'
import type { AppConfig } from '../config/env'

let appConfig: AppConfig | null = null
let connectionPromise: Promise<typeof mongoose> | null = null

// Evita inyección de operadores ($gt, $ne…) si llegara un objeto en lugar de un valor.
mongoose.set('sanitizeFilter', true)
mongoose.set('strictQuery', true)

export function configureDatabase(config: AppConfig): void {
  appConfig = config
}

/** Garantiza que exista una conexión activa; reutiliza la conexión en curso. */
export function ensureDatabaseConnection(): Promise<typeof mongoose> {
  if (!appConfig) return Promise.reject(new Error('Database is not configured'))
  connectionPromise ??= mongoose
    .connect(appConfig.mongodbUri, {
      dbName: appConfig.mongodbDbName,
      serverSelectionTimeoutMS: DATABASE_TIMEOUTS.SERVER_SELECTION_MS
    })
    .catch((error: unknown) => {
      connectionPromise = null
      throw error
    })
  return connectionPromise
}

export async function closeDatabaseConnection(): Promise<void> {
  if (connectionPromise) await mongoose.disconnect()
  connectionPromise = null
}
