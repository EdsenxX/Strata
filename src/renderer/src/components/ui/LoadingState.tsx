import { COMMON_TEXTS } from '@shared/constants'
import { Spinner } from './Spinner'

export function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-muted" role="status">
      <Spinner className="size-5" />
      {COMMON_TEXTS.LOADING}
    </div>
  )
}
