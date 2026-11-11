import {
  TASK_STATUS_LABELS,
  TASK_STATUS_VALUES,
  TASK_TEXTS,
  type TaskStatus
} from '@shared/constants'
import { TASK_STATUS_COLORS } from '../ui/StatusBadge'
import { cn } from '../ui/cn'

interface StatusSelectorProps {
  value: TaskStatus
  disabled?: boolean
  onChange: (status: TaskStatus) => void
}

/** Selector de estado como grupo de botones neumórficos (el activo queda hundido). */
export function StatusSelector({ value, disabled, onChange }: StatusSelectorProps) {
  return (
    <div role="radiogroup" aria-label={TASK_TEXTS.STATUS_LABEL} className="grid grid-cols-2 gap-3">
      {TASK_STATUS_VALUES.map((status) => {
        const active = status === value
        const colors = TASK_STATUS_COLORS[status]
        return (
          <button
            key={status}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => !active && onChange(status)}
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-neu-sm px-3 py-2.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60',
              active
                ? cn('shadow-neu-inset', colors.text)
                : 'text-muted shadow-neu-sm hover:text-ink'
            )}
          >
            <span className={cn('size-2 rounded-full', colors.dot)} />
            {TASK_STATUS_LABELS[status]}
          </button>
        )
      })}
    </div>
  )
}
