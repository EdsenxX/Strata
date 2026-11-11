import { formatDuration } from '@shared/utils/duration'
import { useElapsedSeconds } from '../../hooks/useElapsedSeconds'
import { cn } from '../ui/cn'

interface ElapsedTimeProps {
  timeSpentSeconds: number
  timerStartedAt: string | null
  className?: string
}

/** Tiempo total en formato HH:MM:SS; late un punto mientras el cronómetro corre. */
export function ElapsedTime({ timeSpentSeconds, timerStartedAt, className }: ElapsedTimeProps) {
  const seconds = useElapsedSeconds(timeSpentSeconds, timerStartedAt)
  return (
    <span className={cn('inline-flex items-center gap-2 font-mono tabular-nums', className)}>
      {timerStartedAt && <span className="size-2 animate-pulse rounded-full bg-info" aria-hidden />}
      {formatDuration(seconds)}
    </span>
  )
}
