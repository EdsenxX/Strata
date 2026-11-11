/**
 * Tareas: contenido en Markdown, estado y registro de tiempo (manual o con cronómetro).
 *
 * Modelo del cronómetro:
 * - `timeSpentSeconds` guarda el tiempo acumulado de tramos ya cerrados.
 * - `timerStartedAt` marca el inicio del tramo en curso (null si está detenido).
 * Al pausar se suma el tramo al acumulado. Así el tiempo sobrevive a cierres de la app.
 *
 * Los estados son configurables (ver statusService); el cronómetro se apoya en sus categorías.
 */
import type { Types } from 'mongoose'
import {
  ERROR_CODES,
  FIELD_LIMITS,
  STATUS_CATEGORIES,
  type StatusCategory
} from '@shared/constants'
import type { TaskDto, TaskSummaryDto } from '@shared/types'
import { TaskModel } from '../database/models/Task'
import { TaskStatusModel } from '../database/models/TaskStatus'
import { AppError } from '../errors/AppError'
import { requireUserId } from '../session/sessionStore'
import { requireFound, requireObject, requireObjectId, requireText } from '../utils/inputGuards'
import { toTaskDto, toTaskSummaryDto } from './mappers'
import { findOwnedPhase } from './phaseService'
import { touchProject } from './projectService'
import { findOwnedStatus, getDefaultStatus } from './statusService'
import { stopRunningTimer, type TaskDocument } from './timer'

async function findOwnedTaskDocument(
  userId: Types.ObjectId,
  rawId: unknown
): Promise<TaskDocument> {
  return requireFound(await TaskModel.findOne({ _id: requireObjectId(rawId), userId }))
}

async function saveTask(userId: Types.ObjectId, task: TaskDocument): Promise<TaskDto> {
  await task.save()
  await touchProject(userId, task.projectId)
  return toTaskDto(task.toObject())
}

/** Categoría del estado actual de la tarea (null si el estado ya no existe). */
async function getCurrentCategory(
  userId: Types.ObjectId,
  task: TaskDocument
): Promise<StatusCategory | null> {
  const status = await TaskStatusModel.findOne({ _id: task.statusId, userId }).lean()
  return status?.category ?? null
}

/** Mueve la tarea al estado por defecto de la categoría, salvo que ya esté en esa categoría. */
async function moveToCategory(
  userId: Types.ObjectId,
  task: TaskDocument,
  category: StatusCategory
): Promise<void> {
  if ((await getCurrentCategory(userId, task)) === category) return
  task.statusId = (await getDefaultStatus(userId, category))._id
}

/** Lista las tareas de una fase, de la más reciente a la más antigua (sin contenido). */
export async function listTasks(rawPhaseId: unknown): Promise<TaskSummaryDto[]> {
  const userId = requireUserId()
  const phase = await findOwnedPhase(userId, requireObjectId(rawPhaseId))
  const tasks = await TaskModel.find({ userId, phaseId: phase._id })
    .select({ content: 0 })
    .sort({ createdAt: -1 })
    .lean()
  return tasks.map(toTaskSummaryDto)
}

export async function getTask(rawId: unknown): Promise<TaskDto> {
  const userId = requireUserId()
  return toTaskDto((await findOwnedTaskDocument(userId, rawId)).toObject())
}

export async function createTask(raw: unknown): Promise<TaskDto> {
  const userId = requireUserId()
  const data = requireObject(raw)
  const phase = await findOwnedPhase(userId, requireObjectId(data.phaseId))
  const task = await TaskModel.create({
    userId,
    environmentId: phase.environmentId,
    projectId: phase.projectId,
    phaseId: phase._id,
    statusId: (await getDefaultStatus(userId, STATUS_CATEGORIES.PENDING))._id,
    title: requireText(data.title, FIELD_LIMITS.TASK_TITLE_MAX)
  })
  await touchProject(userId, phase.projectId)
  return toTaskDto(task.toObject())
}

/** Actualiza título, contenido y/o estado. Un estado fuera de la categoría "en curso" detiene el cronómetro. */
export async function updateTask(raw: unknown): Promise<TaskDto> {
  const userId = requireUserId()
  const data = requireObject(raw)
  const task = await findOwnedTaskDocument(userId, data.id)

  if (data.title !== undefined) task.title = requireText(data.title, FIELD_LIMITS.TASK_TITLE_MAX)

  if (data.content !== undefined) {
    if (typeof data.content !== 'string' || data.content.length > FIELD_LIMITS.TASK_CONTENT_MAX) {
      throw new AppError(ERROR_CODES.VALIDATION_FAILED)
    }
    task.content = data.content
  }

  if (data.statusId !== undefined) {
    const status = await findOwnedStatus(userId, requireObjectId(data.statusId))
    if (status.category !== STATUS_CATEGORIES.IN_PROGRESS) stopRunningTimer(task)
    task.statusId = status._id
  }

  return saveTask(userId, task)
}

export async function deleteTask(rawId: unknown): Promise<null> {
  const userId = requireUserId()
  const task = await findOwnedTaskDocument(userId, rawId)
  await TaskModel.deleteOne({ _id: task._id, userId })
  await touchProject(userId, task.projectId)
  return null
}

/** Inicia el cronómetro y pasa la tarea a un estado de categoría "en curso". */
export async function startTaskTimer(rawId: unknown): Promise<TaskDto> {
  const userId = requireUserId()
  const task = await findOwnedTaskDocument(userId, rawId)
  if (!task.timerStartedAt) task.timerStartedAt = new Date()
  await moveToCategory(userId, task, STATUS_CATEGORIES.IN_PROGRESS)
  return saveTask(userId, task)
}

/** Pausa el cronómetro, acumula el tiempo y pasa la tarea a un estado de categoría "en pausa". */
export async function pauseTaskTimer(rawId: unknown): Promise<TaskDto> {
  const userId = requireUserId()
  const task = await findOwnedTaskDocument(userId, rawId)
  stopRunningTimer(task)
  await moveToCategory(userId, task, STATUS_CATEGORIES.PAUSED)
  return saveTask(userId, task)
}

/** Fija manualmente el tiempo total. No se permite con el cronómetro en marcha. */
export async function setTaskTime(raw: unknown): Promise<TaskDto> {
  const userId = requireUserId()
  const data = requireObject(raw)
  const seconds = data.timeSpentSeconds
  if (
    typeof seconds !== 'number' ||
    !Number.isInteger(seconds) ||
    seconds < 0 ||
    seconds > FIELD_LIMITS.TASK_TIME_MAX_SECONDS
  ) {
    throw new AppError(ERROR_CODES.VALIDATION_FAILED)
  }
  const task = await findOwnedTaskDocument(userId, data.id)
  if (task.timerStartedAt) throw new AppError(ERROR_CODES.TIMER_RUNNING)
  task.timeSpentSeconds = seconds
  return saveTask(userId, task)
}
