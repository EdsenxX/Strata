import { COMMON_TEXTS } from '@shared/constants'

interface FieldLabelProps {
  htmlFor: string
  label: string
  required?: boolean
}

/** Etiqueta de campo; los obligatorios llevan un asterisco rojo (ver RequiredFieldsNote). */
export function FieldLabel({ htmlFor, label, required = false }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className="pl-1 text-xs font-semibold text-muted">
      {label}
      {required && (
        <span aria-hidden className="ml-0.5 text-danger">
          {COMMON_TEXTS.REQUIRED_MARK}
        </span>
      )}
    </label>
  )
}
