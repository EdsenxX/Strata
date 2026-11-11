import { useState, type FormEvent } from 'react'
import {
  COMMON_TEXTS,
  FIELD_LIMITS,
  TASK_TEXTS,
  TIME_UNITS,
  VALIDATION_TEXTS
} from '@shared/constants'
import { joinDuration, splitDuration } from '@shared/utils/duration'
import { getErrorMessage } from '../../api/client'
import { BUTTON_VARIANTS, Button } from '../ui/Button'
import { ErrorBanner } from '../ui/ErrorBanner'
import { Modal } from '../ui/Modal'
import { TextField } from '../ui/TextField'

interface ManualTimeModalProps {
  open: boolean
  initialSeconds: number
  onSubmit: (seconds: number) => Promise<void>
  onClose: () => void
}

const MAX_HOURS = Math.floor(FIELD_LIMITS.TASK_TIME_MAX_SECONDS / TIME_UNITS.SECONDS_PER_HOUR)
const MAX_MINUTES_OR_SECONDS = TIME_UNITS.SECONDS_PER_MINUTE - 1

/** Edición manual del tiempo invertido (horas, minutos y segundos). */
export function ManualTimeModal(props: ManualTimeModalProps) {
  return (
    <Modal open={props.open} title={TASK_TEXTS.MANUAL_TIME_TITLE} onClose={props.onClose}>
      {props.open && <ManualTimeForm {...props} />}
    </Modal>
  )
}

const toNumber = (value: string): number => (value === '' ? 0 : Number(value))

function ManualTimeForm({ initialSeconds, onSubmit, onClose }: ManualTimeModalProps) {
  const initial = splitDuration(initialSeconds)
  const [hours, setHours] = useState(String(initial.hours))
  const [minutes, setMinutes] = useState(String(initial.minutes))
  const [seconds, setSeconds] = useState(String(initial.seconds))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const parts = { hours: toNumber(hours), minutes: toNumber(minutes), seconds: toNumber(seconds) }
    const valid =
      Object.values(parts).every((value) => Number.isInteger(value) && value >= 0) &&
      parts.hours <= MAX_HOURS &&
      parts.minutes <= MAX_MINUTES_OR_SECONDS &&
      parts.seconds <= MAX_MINUTES_OR_SECONDS
    if (!valid) {
      setError(VALIDATION_TEXTS.INVALID_TIME)
      return
    }
    setLoading(true)
    setError(null)
    try {
      await onSubmit(joinDuration(parts))
      onClose()
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <p className="text-sm text-muted">{TASK_TEXTS.MANUAL_TIME_HINT}</p>
      <div className="grid grid-cols-3 gap-4">
        <TextField
          label={TASK_TEXTS.HOURS}
          type="number"
          min={0}
          max={MAX_HOURS}
          autoFocus
          value={hours}
          onChange={(event) => setHours(event.target.value)}
        />
        <TextField
          label={TASK_TEXTS.MINUTES}
          type="number"
          min={0}
          max={MAX_MINUTES_OR_SECONDS}
          value={minutes}
          onChange={(event) => setMinutes(event.target.value)}
        />
        <TextField
          label={TASK_TEXTS.SECONDS}
          type="number"
          min={0}
          max={MAX_MINUTES_OR_SECONDS}
          value={seconds}
          onChange={(event) => setSeconds(event.target.value)}
        />
      </div>
      {error && <ErrorBanner message={error} />}
      <div className="flex justify-end gap-3">
        <Button variant={BUTTON_VARIANTS.GHOST} onClick={onClose}>
          {COMMON_TEXTS.CANCEL}
        </Button>
        <Button type="submit" variant={BUTTON_VARIANTS.PRIMARY} loading={loading}>
          {COMMON_TEXTS.SAVE}
        </Button>
      </div>
    </form>
  )
}
