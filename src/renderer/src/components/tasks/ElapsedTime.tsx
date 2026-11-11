import { formatDuration } from '@shared/utils/duration'
import { useLiveSeconds } from '../../hooks/useLiveSeconds'
import { cn } from '../ui/cn'

interface ElapsedTimeProps {
  timeSpentSeconds: number
  /** Inicio de cada cronómetro en marcha (uno para una tarea; varios para una fase o proyecto). */
  runningTimerStartedAts: readonly string[]
  className?: string
}

/** Tiempo en formato HH:MM:SS; late un punto mientras algún cronómetro corre. */
export function ElapsedTime({
  timeSpentSeconds,
  runningTimerStartedAts,
  className
}: ElapsedTimeProps) {
  const seconds = useLiveSeconds(timeSpentSeconds, runningTimerStartedAts)
  return (
    <span className={cn('inline-flex items-center gap-2 font-mono tabular-nums', className)}>
      {runningTimerStartedAts.length > 0 && (
        <span className="size-2 animate-pulse rounded-full bg-info" aria-hidden />
      )}
      {formatDuration(seconds)}
    </span>
  )
}

/** Cronómetros activos de una sola tarea, en el formato que espera ElapsedTime. */
export const runningTimersOf = (task: { timerStartedAt: string | null }): string[] =>
  task.timerStartedAt ? [task.timerStartedAt] : []
