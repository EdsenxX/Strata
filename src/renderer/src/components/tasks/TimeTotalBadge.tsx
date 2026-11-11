import { Clock } from 'lucide-react'
import type { TimeTotals } from '@shared/types'
import { cn } from '../ui/cn'
import { ElapsedTime } from './ElapsedTime'

interface TimeTotalBadgeProps {
  totals: TimeTotals
  /** Texto opcional antes del tiempo (por ejemplo, "Tiempo total"). */
  label?: string
  className?: string
}

/** Píldora hundida con la suma de tiempo de una fase o proyecto (se actualiza en vivo). */
export function TimeTotalBadge({ totals, label, className }: TimeTotalBadgeProps) {
  return (
    <span
      title={label}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-muted shadow-neu-inset-sm',
        className
      )}
    >
      <Clock className="size-3.5 shrink-0" aria-hidden />
      {label && <span className="font-semibold">{label}</span>}
      <ElapsedTime
        className="font-semibold text-ink"
        timeSpentSeconds={totals.timeSpentSeconds}
        runningTimerStartedAts={totals.runningTimerStartedAts}
      />
    </span>
  )
}
