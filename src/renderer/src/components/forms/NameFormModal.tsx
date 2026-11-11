import { useState, type FormEvent } from 'react'
import { COMMON_TEXTS, FIELD_LIMITS, VALIDATION_TEXTS } from '@shared/constants'
import { getErrorMessage } from '../../api/client'
import { BUTTON_VARIANTS, Button } from '../ui/Button'
import { ErrorBanner } from '../ui/ErrorBanner'
import { Modal } from '../ui/Modal'
import { RequiredFieldsNote } from '../ui/RequiredFieldsNote'
import { TextField } from '../ui/TextField'

interface NameFormModalProps {
  open: boolean
  title: string
  label: string
  placeholder?: string
  initialValue?: string
  submitLabel?: string
  onSubmit: (name: string) => Promise<void>
  onClose: () => void
}

/**
 * Formulario de un solo campo "nombre". Se reutiliza para crear y renombrar
 * entornos y fases. Monta el contenido solo cuando está abierto para reiniciar el estado.
 */
export function NameFormModal(props: NameFormModalProps) {
  return (
    <Modal open={props.open} title={props.title} onClose={props.onClose}>
      {props.open && <NameForm {...props} />}
    </Modal>
  )
}

function NameForm({
  label,
  placeholder,
  initialValue = '',
  submitLabel = COMMON_TEXTS.SAVE,
  onSubmit,
  onClose
}: NameFormModalProps) {
  const [name, setName] = useState(initialValue)
  const [fieldError, setFieldError] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    setFieldError(trimmed ? undefined : VALIDATION_TEXTS.REQUIRED)
    if (!trimmed) return
    setLoading(true)
    setError(null)
    try {
      await onSubmit(trimmed)
      onClose()
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <TextField
        label={label}
        placeholder={placeholder}
        value={name}
        maxLength={FIELD_LIMITS.ENTITY_NAME_MAX}
        autoFocus
        required
        error={fieldError}
        onChange={(event) => {
          setName(event.target.value)
          setFieldError(undefined)
        }}
      />
      <RequiredFieldsNote />
      {error && <ErrorBanner message={error} />}
      <div className="flex justify-end gap-3">
        <Button variant={BUTTON_VARIANTS.GHOST} onClick={onClose}>
          {COMMON_TEXTS.CANCEL}
        </Button>
        <Button type="submit" variant={BUTTON_VARIANTS.PRIMARY} loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
