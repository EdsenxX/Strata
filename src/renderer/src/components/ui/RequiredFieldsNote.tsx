import { COMMON_TEXTS } from '@shared/constants'
import { cn } from './cn'

/** Leyenda que explica el asterisco de los campos obligatorios. Va debajo de los campos. */
export function RequiredFieldsNote({ className }: { className?: string }) {
  return (
    <p className={cn('pl-1 text-xs text-muted', className)}>
      <span aria-hidden className="mr-0.5 text-danger">
        {COMMON_TEXTS.REQUIRED_MARK}
      </span>
      {COMMON_TEXTS.REQUIRED_FIELDS_NOTE}
    </p>
  )
}
