import { TASK_TEXTS } from '@shared/constants'
import { useStatusStore } from '../../stores/statusStore'
import { cn } from '../ui/cn'
import { STATUS_COLOR_CLASSES } from '../ui/statusColors'

interface StatusSelectorProps {
  value: string
  disabled?: boolean
  onChange: (statusId: string) => void
}

/** Selector de estado con los estados del usuario (el activo queda hundido). */
export function StatusSelector({ value, disabled, onChange }: StatusSelectorProps) {
  const statuses = useStatusStore((state) => state.statuses) ?? []
  return (
    <div role="radiogroup" aria-label={TASK_TEXTS.STATUS_LABEL} className="grid grid-cols-2 gap-3">
      {statuses.map((status) => {
        const active = status.id === value
        const colors = STATUS_COLOR_CLASSES[status.color]
        return (
          <button
            key={status.id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            title={status.name}
            onClick={() => !active && onChange(status.id)}
            className={cn(
              'flex min-w-0 cursor-pointer items-center gap-2 rounded-neu-sm px-3 py-2.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60',
              active
                ? cn('shadow-neu-inset', colors.text)
                : 'text-muted shadow-neu-sm hover:text-ink'
            )}
          >
            <span className={cn('size-2 shrink-0 rounded-full', colors.dot)} />
            <span className="truncate">{status.name}</span>
          </button>
        )
      })}
    </div>
  )
}
