import { useStatus, useStatusStore } from '../../stores/statusStore'
import { Skeleton } from './Skeleton'
import { cn } from './cn'
import { STATUS_COLOR_CLASSES } from './statusColors'

/** Insignia del estado de una tarea, resuelto desde el catálogo del usuario. */
export function StatusBadge({ statusId, className }: { statusId: string; className?: string }) {
  const status = useStatus(statusId)
  const loaded = useStatusStore((state) => state.statuses !== null)
  if (!status) return loaded ? null : <Skeleton className={cn('h-6 rounded-full', className)} />
  const colors = STATUS_COLOR_CLASSES[status.color]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap shadow-neu-inset-sm',
        colors.text,
        className
      )}
    >
      <span className={cn('size-2 shrink-0 rounded-full', colors.dot)} />
      <span className="truncate">{status.name}</span>
    </span>
  )
}
