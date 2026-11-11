import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from './cn'
import { FieldLabel } from './FieldLabel'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: ReactNode
  /** Contenido a la derecha dentro del campo (por ejemplo, mostrar contraseña). */
  trailing?: ReactNode
}

export const insetFieldClasses =
  'w-full rounded-neu-sm bg-base px-4 py-3 text-sm text-ink shadow-neu-inset outline-none transition-shadow placeholder:text-muted/70 focus:shadow-neu-inset-sm focus:ring-2 focus:ring-accent/40 disabled:opacity-60'

export function TextField({
  label,
  error,
  hint,
  trailing,
  id,
  className,
  required,
  ...props
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const messageId = `${inputId}-message`

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <FieldLabel htmlFor={inputId} label={label} required={required} />
      <div className="relative">
        <input
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(
            insetFieldClasses,
            trailing ? 'pr-12' : undefined,
            error && 'ring-2 ring-danger/50'
          )}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div>}
      </div>
      {(error || hint) && (
        <div id={messageId} className={cn('pl-1 text-xs', error ? 'text-danger' : 'text-muted')}>
          {error ?? hint}
        </div>
      )}
    </div>
  )
}
