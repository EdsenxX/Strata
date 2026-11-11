import { useId } from 'react'
import { cn } from './cn'

interface ToggleProps {
  label: string
  hint?: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}

/** Interruptor neumórfico: pista hundida y perilla elevada que se desliza. */
export function Toggle({ label, hint, checked, disabled, onChange }: ToggleProps) {
  const labelId = useId()
  const hintId = useId()
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="space-y-1">
        <p id={labelId} className="text-sm font-semibold">
          {label}
        </p>
        {hint && (
          <p id={hintId} className="text-xs text-muted">
            {hint}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={hint ? hintId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-8 w-14 shrink-0 cursor-pointer rounded-full shadow-neu-inset transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          checked && 'bg-accent/25'
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 size-6 rounded-full shadow-neu-sm transition-all',
            checked ? 'translate-x-6 bg-accent' : 'bg-base'
          )}
        />
      </button>
    </div>
  )
}
