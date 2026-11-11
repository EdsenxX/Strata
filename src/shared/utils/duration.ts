/**
 * Utilidades para trabajar con duraciones expresadas en segundos.
 */
import { TIME_UNITS } from '../constants/ui'

export interface DurationParts {
  hours: number
  minutes: number
  seconds: number
}

export function splitDuration(totalSeconds: number): DurationParts {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  return {
    hours: Math.floor(safeSeconds / TIME_UNITS.SECONDS_PER_HOUR),
    minutes: Math.floor(
      (safeSeconds % TIME_UNITS.SECONDS_PER_HOUR) / TIME_UNITS.SECONDS_PER_MINUTE
    ),
    seconds: safeSeconds % TIME_UNITS.SECONDS_PER_MINUTE
  }
}

export function joinDuration({ hours, minutes, seconds }: DurationParts): number {
  return hours * TIME_UNITS.SECONDS_PER_HOUR + minutes * TIME_UNITS.SECONDS_PER_MINUTE + seconds
}

const pad = (value: number): string => String(value).padStart(2, '0')

/** Formatea segundos como `HH:MM:SS`. */
export function formatDuration(totalSeconds: number): string {
  const { hours, minutes, seconds } = splitDuration(totalSeconds)
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

/** Segundos transcurridos desde `startedAt` (nunca negativos). */
function secondsSince(startedAt: string | Date, now: number): number {
  return Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / TIME_UNITS.MS_PER_SECOND))
}

/**
 * Tiempo total de un grupo (tarea, fase o proyecto): lo acumulado más el tramo en curso de cada
 * cronómetro activo.
 */
export function computeTotalSeconds(
  timeSpentSeconds: number,
  runningTimerStartedAts: readonly (string | Date)[],
  now: number = Date.now()
): number {
  return runningTimerStartedAts.reduce<number>(
    (total, startedAt) => total + secondsSince(startedAt, now),
    timeSpentSeconds
  )
}

/**
 * Tiempo total de una tarea: lo acumulado más el tramo del cronómetro en curso.
 */
export function computeElapsedSeconds(
  timeSpentSeconds: number,
  timerStartedAt: string | Date | null,
  now: number = Date.now()
): number {
  return computeTotalSeconds(timeSpentSeconds, timerStartedAt ? [timerStartedAt] : [], now)
}
