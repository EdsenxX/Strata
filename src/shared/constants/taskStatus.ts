/**
 * Estados posibles de una tarea.
 */
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  COMPLETED: 'completed'
} as const

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS]

/** Lista ordenada de estados (orden en el que se muestran en la interfaz). */
export const TASK_STATUS_VALUES: readonly TaskStatus[] = [
  TASK_STATUS.PENDING,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.PAUSED,
  TASK_STATUS.COMPLETED
]

/** Estado con el que nace toda tarea nueva. */
export const DEFAULT_TASK_STATUS: TaskStatus = TASK_STATUS.PENDING
