/**
 * Preferencias locales (por equipo) guardadas en un JSON dentro de `userData`:
 * tema y descarga automática de actualizaciones.
 *
 * El tema se aplica con `nativeTheme.themeSource`: Chromium ajusta entonces
 * `prefers-color-scheme`, así que el CSS, las barras de scroll y los diálogos nativos
 * siguen la elección sin lógica adicional en la interfaz.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { app, nativeTheme } from 'electron'
import {
  DEFAULT_AUTO_DOWNLOAD_UPDATES,
  DEFAULT_THEME_MODE,
  ERROR_CODES,
  PREFERENCES_FILE_NAME,
  THEME_MODE_VALUES,
  type ThemeMode
} from '@shared/constants'
import { AppError } from '../errors/AppError'
import { setAutoDownload } from './updaterService'

interface Preferences {
  themeMode: ThemeMode
  autoDownloadUpdates: boolean
}

const DEFAULT_PREFERENCES: Preferences = {
  themeMode: DEFAULT_THEME_MODE,
  autoDownloadUpdates: DEFAULT_AUTO_DOWNLOAD_UPDATES
}

const preferencesFilePath = (): string => join(app.getPath('userData'), PREFERENCES_FILE_NAME)

const isThemeMode = (value: unknown): value is ThemeMode =>
  THEME_MODE_VALUES.includes(value as ThemeMode)

async function readPreferences(): Promise<Preferences> {
  try {
    const stored = JSON.parse(
      await readFile(preferencesFilePath(), 'utf-8')
    ) as Partial<Preferences>
    return {
      themeMode: isThemeMode(stored.themeMode) ? stored.themeMode : DEFAULT_THEME_MODE,
      autoDownloadUpdates:
        typeof stored.autoDownloadUpdates === 'boolean'
          ? stored.autoDownloadUpdates
          : DEFAULT_AUTO_DOWNLOAD_UPDATES
    }
  } catch {
    // Archivo inexistente o corrupto: se usan los valores por defecto.
    return DEFAULT_PREFERENCES
  }
}

async function writePreferences(preferences: Preferences): Promise<void> {
  await writeFile(preferencesFilePath(), JSON.stringify(preferences, null, 2))
}

/** Aplica el tema guardado; se llama al arrancar, antes de crear la ventana. */
export async function applyStoredThemeMode(): Promise<void> {
  nativeTheme.themeSource = (await readPreferences()).themeMode
}

export async function getThemeMode(): Promise<ThemeMode> {
  return (await readPreferences()).themeMode
}

export async function setThemeMode(raw: unknown): Promise<ThemeMode> {
  if (!isThemeMode(raw)) throw new AppError(ERROR_CODES.VALIDATION_FAILED)
  nativeTheme.themeSource = raw
  await writePreferences({ ...(await readPreferences()), themeMode: raw })
  return raw
}

export async function getAutoDownloadUpdates(): Promise<boolean> {
  return (await readPreferences()).autoDownloadUpdates
}

export async function setAutoDownloadUpdates(raw: unknown): Promise<boolean> {
  if (typeof raw !== 'boolean') throw new AppError(ERROR_CODES.VALIDATION_FAILED)
  await writePreferences({ ...(await readPreferences()), autoDownloadUpdates: raw })
  setAutoDownload(raw)
  return raw
}
