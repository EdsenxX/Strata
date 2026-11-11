import { useState, type FormEvent } from 'react'
import { COMMON_TEXTS, FIELD_LIMITS, PROJECT_TEXTS, VALIDATION_TEXTS } from '@shared/constants'
import { getErrorMessage } from '../../api/client'
import { BUTTON_VARIANTS, Button } from '../ui/Button'
import { ErrorBanner } from '../ui/ErrorBanner'
import { Modal } from '../ui/Modal'
import { RequiredFieldsNote } from '../ui/RequiredFieldsNote'
import { TextArea } from '../ui/TextArea'
import { TextField } from '../ui/TextField'

export interface ProjectFormValues {
  name: string
  description: string
}

interface ProjectFormModalProps {
  open: boolean
  title: string
  initialValues?: ProjectFormValues
  submitLabel?: string
  onSubmit: (values: ProjectFormValues) => Promise<void>
  onClose: () => void
}

const EMPTY_VALUES: ProjectFormValues = { name: '', description: '' }

/** Formulario de creación/edición de proyectos (nombre y descripción). */
export function ProjectFormModal(props: ProjectFormModalProps) {
  return (
    <Modal open={props.open} title={props.title} onClose={props.onClose}>
      {props.open && <ProjectForm {...props} />}
    </Modal>
  )
}

function ProjectForm({
  initialValues = EMPTY_VALUES,
  submitLabel = COMMON_TEXTS.SAVE,
  onSubmit,
  onClose
}: ProjectFormModalProps) {
  const [values, setValues] = useState(initialValues)
  const [nameError, setNameError] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const name = values.name.trim()
    setNameError(name ? undefined : VALIDATION_TEXTS.REQUIRED)
    if (!name) return
    setLoading(true)
    setError(null)
    try {
      await onSubmit({ name, description: values.description.trim() })
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
        label={PROJECT_TEXTS.NAME_LABEL}
        placeholder={PROJECT_TEXTS.NAME_PLACEHOLDER}
        value={values.name}
        maxLength={FIELD_LIMITS.ENTITY_NAME_MAX}
        autoFocus
        required
        error={nameError}
        onChange={(event) => {
          setValues((current) => ({ ...current, name: event.target.value }))
          setNameError(undefined)
        }}
      />
      <TextArea
        label={PROJECT_TEXTS.DESCRIPTION_LABEL}
        placeholder={PROJECT_TEXTS.DESCRIPTION_PLACEHOLDER}
        value={values.description}
        maxLength={FIELD_LIMITS.DESCRIPTION_MAX}
        onChange={(event) =>
          setValues((current) => ({ ...current, description: event.target.value }))
        }
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
