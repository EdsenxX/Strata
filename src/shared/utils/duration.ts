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

/**
 * Tiempo total de una tarea: lo acumulado más el tramo del cronómetro en curso.
 */
export function computeElapsedSeconds(
  timeSpentSeconds: number,
  timerStartedAt: string | Date | null,
  now: number = Date.now()
): number {
  if (!timerStartedAt) return timeSpentSeconds
  const startedAt = new Date(timerStartedAt).getTime()
  const runningSeconds = Math.max(0, Math.floor((now - startedAt) / TIME_UNITS.MS_PER_SECOND))
  return timeSpentSeconds + runningSeconds
}
