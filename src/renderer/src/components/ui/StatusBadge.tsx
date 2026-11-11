import { TASK_STATUS, TASK_STATUS_LABELS, type TaskStatus } from '@shared/constants'
import { cn } from './cn'

/** Color asociado a cada estado de tarea (clases de Tailwind). */
export const TASK_STATUS_COLORS: Record<TaskStatus, { text: string; dot: string }> = {
  [TASK_STATUS.PENDING]: { text: 'text-muted', dot: 'bg-muted' },
  [TASK_STATUS.IN_PROGRESS]: { text: 'text-info', dot: 'bg-info' },
  [TASK_STATUS.PAUSED]: { text: 'text-warning', dot: 'bg-warning' },
  [TASK_STATUS.COMPLETED]: { text: 'text-success', dot: 'bg-success' }
}

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const colors = TASK_STATUS_COLORS[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold shadow-neu-inset-sm',
        colors.text,
        className
      )}
    >
      <span className={cn('size-2 rounded-full', colors.dot)} />
      {TASK_STATUS_LABELS[status]}
    </span>
  )
}
