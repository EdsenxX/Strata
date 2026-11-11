import { useId, useState, type FormEvent } from 'react'
import { Check } from 'lucide-react'
import {
  COMMON_TEXTS,
  FIELD_LIMITS,
  STATUS_CATEGORIES,
  STATUS_CATEGORY_HINTS,
  STATUS_CATEGORY_LABELS,
  STATUS_CATEGORY_VALUES,
  STATUS_COLOR_LABELS,
  STATUS_COLOR_VALUES,
  STATUS_COLORS,
  STATUS_TEXTS,
  VALIDATION_TEXTS,
  type StatusCategory
} from '@shared/constants'
import type { CreateStatusInput } from '@shared/types'
import { getErrorMessage } from '../../api/client'
import { BUTTON_VARIANTS, Button } from '../ui/Button'
import { ErrorBanner } from '../ui/ErrorBanner'
import { FieldLabel } from '../ui/FieldLabel'
import { Modal } from '../ui/Modal'
import { RequiredFieldsNote } from '../ui/RequiredFieldsNote'
import { TextField } from '../ui/TextField'
import { cn } from '../ui/cn'
import { STATUS_COLOR_CLASSES } from '../ui/statusColors'

interface StatusFormModalProps {
  open: boolean
  title: string
  initialValues?: CreateStatusInput
  /** Categorías que no se pueden elegir (por ejemplo, si el estado es el último de la suya). */
  lockedCategory?: StatusCategory
  submitLabel?: string
  onSubmit: (values: CreateStatusInput) => Promise<void>
  onClose: () => void
}

const EMPTY_VALUES: CreateStatusInput = {
  name: '',
  color: STATUS_COLORS.VIOLET,
  category: STATUS_CATEGORIES.PENDING
}

/** Formulario de estados: nombre, color y categoría (comportamiento). */
export function StatusFormModal(props: StatusFormModalProps) {
  return (
    <Modal open={props.open} title={props.title} onClose={props.onClose}>
      {props.open && <StatusForm {...props} />}
    </Modal>
  )
}

function StatusForm({
  initialValues = EMPTY_VALUES,
  lockedCategory,
  submitLabel = COMMON_TEXTS.SAVE,
  onSubmit,
  onClose
}: StatusFormModalProps) {
  const colorLabelId = useId()
  const categoryLabelId = useId()
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
      await onSubmit({ ...values, name })
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
        label={STATUS_TEXTS.NAME_LABEL}
        placeholder={STATUS_TEXTS.NAME_PLACEHOLDER}
        value={values.name}
        maxLength={FIELD_LIMITS.STATUS_NAME_MAX}
        autoFocus
        required
        error={nameError}
        onChange={(event) => {
          setValues((current) => ({ ...current, name: event.target.value }))
          setNameError(undefined)
        }}
      />

      <div className="flex flex-col gap-2">
        <FieldLabel id={colorLabelId} label={STATUS_TEXTS.COLOR_LABEL} required />
        <div role="radiogroup" aria-labelledby={colorLabelId} className="flex flex-wrap gap-3 pl-1">
          {STATUS_COLOR_VALUES.map((color) => {
            const active = values.color === color
            return (
              <button
                key={color}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={STATUS_COLOR_LABELS[color]}
                title={STATUS_COLOR_LABELS[color]}
                onClick={() => setValues((current) => ({ ...current, color }))}
                className={cn(
                  'flex size-9 cursor-pointer items-center justify-center rounded-full transition-all',
                  active ? 'shadow-neu-inset' : 'shadow-neu-sm hover:shadow-neu'
                )}
              >
                <span
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full text-base',
                    STATUS_COLOR_CLASSES[color].dot
                  )}
                >
                  {active && <Check className="size-3 text-white" />}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel id={categoryLabelId} label={STATUS_TEXTS.CATEGORY_LABEL} required />
        <div role="radiogroup" aria-labelledby={categoryLabelId} className="grid grid-cols-2 gap-3">
          {STATUS_CATEGORY_VALUES.map((category) => {
            const active = values.category === category
            const disabled = lockedCategory !== undefined && category !== lockedCategory
            return (
              <button
                key={category}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled}
                title={disabled ? STATUS_TEXTS.LAST_IN_CATEGORY_HINT : undefined}
                onClick={() => setValues((current) => ({ ...current, category }))}
                className={cn(
                  'flex cursor-pointer flex-col gap-1 rounded-neu-sm px-3 py-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50',
                  active ? 'text-accent shadow-neu-inset' : 'shadow-neu-sm hover:shadow-neu'
                )}
              >
                <span className="text-xs font-semibold">{STATUS_CATEGORY_LABELS[category]}</span>
                <span className="text-[11px] leading-snug text-muted">
                  {STATUS_CATEGORY_HINTS[category]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

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
