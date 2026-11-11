/**
 * Carga y valida las variables de entorno (secretos) del proceso principal.
 *
 * - Desarrollo: lee `.env` en la raíz del proyecto.
 * - Producción: lee `.env` en la carpeta de datos del usuario o junto al ejecutable.
 */
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { app } from 'electron'
import { config as loadDotenv } from 'dotenv'
import { ENV_FILE_NAME, ENV_KEYS } from '@shared/constants'

export interface AppConfig {
  mongodbUri: string
  mongodbDbName: string
}

export class ConfigError extends Error {
  constructor(
    readonly missingKeys: string[],
    readonly searchedPaths: string[]
  ) {
    super(`Missing environment variables: ${missingKeys.join(', ')}`)
  }
}

function getEnvFileCandidates(): string[] {
  if (!app.isPackaged) return [join(app.getAppPath(), ENV_FILE_NAME)]
  return [
    join(app.getPath('userData'), ENV_FILE_NAME),
    join(dirname(app.getPath('exe')), ENV_FILE_NAME)
  ]
}

export function loadAppConfig(): AppConfig {
  const candidates = getEnvFileCandidates()
  // dotenv no sobrescribe variables ya definidas, así que el primer archivo encontrado gana.
  candidates.filter((path) => existsSync(path)).forEach((path) => loadDotenv({ path, quiet: true }))

  const mongodbUri = process.env[ENV_KEYS.MONGODB_URI]?.trim() ?? ''
  const mongodbDbName = process.env[ENV_KEYS.MONGODB_DB_NAME]?.trim() ?? ''
  const missingKeys: string[] = []
  if (!mongodbUri) missingKeys.push(ENV_KEYS.MONGODB_URI)
  if (!mongodbDbName) missingKeys.push(ENV_KEYS.MONGODB_DB_NAME)

  if (missingKeys.length > 0) throw new ConfigError(missingKeys, candidates)
  return { mongodbUri, mongodbDbName }
}
