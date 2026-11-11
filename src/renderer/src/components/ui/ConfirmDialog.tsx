import { useState } from 'react'
import { COMMON_TEXTS } from '@shared/constants'
import { getErrorMessage } from '../../api/client'
import { BUTTON_VARIANTS, Button } from './Button'
import { ErrorBanner } from './ErrorBanner'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => Promise<void>
  onClose: () => void
}

/** Confirmación para acciones destructivas. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = COMMON_TEXTS.DELETE,
  onConfirm,
  onClose
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    setError(null)
    onClose()
  }

  const confirm = async () => {
    setLoading(true)
    setError(null)
    try {
      await onConfirm()
      close()
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={close}
      footer={
        <>
          <Button variant={BUTTON_VARIANTS.GHOST} onClick={close}>
            {COMMON_TEXTS.CANCEL}
          </Button>
          <Button variant={BUTTON_VARIANTS.DANGER} loading={loading} onClick={confirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">{description}</p>
      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}
    </Modal>
  )
}
