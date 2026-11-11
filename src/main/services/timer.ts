/**
 * Utilidades del cronómetro de tareas compartidas entre servicios.
 */
import type { HydratedDocument } from 'mongoose'
import { TIME_UNITS } from '@shared/constants'
import type { TaskRecord } from '../database/models/Task'

export type TaskDocument = HydratedDocument<TaskRecord>

/** Cierra el tramo del cronómetro en curso y lo suma al acumulado. */
export function stopRunningTimer(task: TaskDocument, now = Date.now()): void {
  if (!task.timerStartedAt) return
  const elapsedMs = Math.max(0, now - task.timerStartedAt.getTime())
  task.timeSpentSeconds =
    (task.timeSpentSeconds ?? 0) + Math.floor(elapsedMs / TIME_UNITS.MS_PER_SECOND)
  task.timerStartedAt = null
}
