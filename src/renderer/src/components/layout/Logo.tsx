import { Layers } from 'lucide-react'
import { APP_NAME } from '@shared/constants'

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-neu-sm text-accent shadow-neu">
        <Layers className="size-5" />
      </div>
      <span className="text-xl font-extrabold tracking-tight">{APP_NAME}</span>
    </div>
  )
}
