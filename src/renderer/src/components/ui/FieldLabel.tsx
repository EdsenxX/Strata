import { COMMON_TEXTS } from '@shared/constants'

interface FieldLabelProps {
  label: string
  required?: boolean
  /** Id del control asociado (renderiza un `<label>`). */
  htmlFor?: string
  /** Id propio para grupos (radiogroup) que se etiquetan con `aria-labelledby`. */
  id?: string
}

const LABEL_CLASSES = 'pl-1 text-xs font-semibold text-muted'

/** Etiqueta de campo; los obligatorios llevan un asterisco rojo (ver RequiredFieldsNote). */
export function FieldLabel({ label, required = false, htmlFor, id }: FieldLabelProps) {
  const content = (
    <>
      {label}
      {required && (
        <span aria-hidden className="ml-0.5 text-danger">
          {COMMON_TEXTS.REQUIRED_MARK}
        </span>
      )}
    </>
  )
  if (htmlFor) {
    return (
      <label htmlFor={htmlFor} id={id} className={LABEL_CLASSES}>
        {content}
      </label>
    )
  }
  return (
    <span id={id} className={LABEL_CLASSES}>
      {content}
    </span>
  )
}
