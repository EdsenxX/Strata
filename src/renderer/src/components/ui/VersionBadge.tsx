import { APP_NAME, COMMON_TEXTS } from '@shared/constants'
import { cn } from './cn'

/** Muestra la versión actual de la app (tomada de package.json en build). */
export function VersionBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 font-mono text-[11px] text-muted shadow-neu-inset-sm',
        className
      )}
      title={`${APP_NAME} ${COMMON_TEXTS.VERSION_PREFIX}${__APP_VERSION__}`}
    >
      {COMMON_TEXTS.VERSION_PREFIX}
      {__APP_VERSION__}
    </span>
  )
}
