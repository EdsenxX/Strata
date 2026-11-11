import { CircleAlert } from 'lucide-react'
import { COMMON_TEXTS } from '@shared/constants'
import { BUTTON_SIZES, Button } from './Button'

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-center gap-3 rounded-neu-sm px-4 py-3 text-sm text-danger shadow-neu-inset-sm"
    >
      <CircleAlert className="size-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <Button size={BUTTON_SIZES.SM} onClick={onRetry}>
          {COMMON_TEXTS.RETRY}
        </Button>
      )}
    </div>
  )
}
