/**
 * Estados de tarea configurables por usuario (colección `task_statuses`).
 *
 * Invariantes:
 * - Cada usuario tiene al menos un estado por categoría (se siembran los de DEFAULT_TASK_STATUSES).
 * - El estado "por defecto" de una categoría es el primero según `order`.
 * - Una tarea con el cronómetro en marcha siempre está en un estado de categoría `in_progress`.
 */
import { trusted, type Types } from 'mongoose'
import {
  DEFAULT_TASK_STATUSES,
  ERROR_CODES,
  FIELD_LIMITS,
  LEGACY_TASK_STATUS_FIELD,
  STATUS_CATEGORIES,
  STATUS_CATEGORY_VALUES,
  STATUS_COLOR_VALUES,
  type StatusCategory,
  type StatusColor
} from '@shared/constants'
import type { TaskStatusDto } from '@shared/types'
import { TaskModel } from '../database/models/Task'
import { TaskStatusModel, type TaskStatusRecord } from '../database/models/TaskStatus'
import { AppError } from '../errors/AppError'
import { requireUserId } from '../session/sessionStore'
import { requireFound, requireObject, requireObjectId, requireText } from '../utils/inputGuards'
import { toTaskStatusDto } from './mappers'
import { stopRunningTimer } from './timer'

/** Evita sembrar dos veces si llegan llamadas simultáneas del mismo usuario. */
const ensuredUsers = new Map<string, Promise<void>>()

const isCategory = (value: unknown): value is StatusCategory =>
  STATUS_CATEGORY_VALUES.includes(value as StatusCategory)

const isColor = (value: unknown): value is StatusColor =>
  STATUS_COLOR_VALUES.includes(value as StatusColor)

async function seedAndMigrate(userId: Types.ObjectId): Promise<void> {
  if (!(await TaskStatusModel.exists({ userId }))) {
    await TaskStatusModel.insertMany(
      DEFAULT_TASK_STATUSES.map((status, order) => ({ ...status, userId, order }))
    )
  }
  await migrateLegacyTasks(userId)
}

/**
 * Migra tareas del esquema anterior (estado como texto en `status`) a `statusId`.
 * Se usa el driver nativo porque el esquema actual ya no conoce el campo `status`.
 */
async function migrateLegacyTasks(userId: Types.ObjectId): Promise<void> {
  const collection = TaskModel.collection
  const missing = { userId, statusId: { $exists: false } }
  if ((await collection.countDocuments(missing)) === 0) return

  const statuses = await TaskStatusModel.find({ userId }).sort({ order: 1 }).lean()
  const unset = { [LEGACY_TASK_STATUS_FIELD]: '' }
  for (const category of STATUS_CATEGORY_VALUES) {
    const target = statuses.find((status) => status.category === category)
    if (!target) continue
    await collection.updateMany(
      { ...missing, [LEGACY_TASK_STATUS_FIELD]: category },
      { $set: { statusId: target._id }, $unset: unset }
    )
  }
  const fallback = statuses.find((status) => status.category === STATUS_CATEGORIES.PENDING)
  if (fallback) {
    await collection.updateMany(missing, { $set: { statusId: fallback._id }, $unset: unset })
  }
}

/** Garantiza el catálogo inicial del usuario y migra sus tareas antiguas (una vez por proceso). */
export function ensureDefaultStatuses(userId: Types.ObjectId): Promise<void> {
  const key = userId.toString()
  let pending = ensuredUsers.get(key)
  if (!pending) {
    pending = seedAndMigrate(userId).catch((error: unknown) => {
      ensuredUsers.delete(key)
      throw error
    })
    ensuredUsers.set(key, pending)
  }
  return pending
}

export async function findOwnedStatus(
  userId: Types.ObjectId,
  statusId: Types.ObjectId
): Promise<TaskStatusRecord> {
  return requireFound(await TaskStatusModel.findOne({ _id: statusId, userId }).lean())
}

/** Primer estado (según el orden del usuario) de una categoría. */
export async function getDefaultStatus(
  userId: Types.ObjectId,
  category: StatusCategory
): Promise<TaskStatusRecord> {
  await ensureDefaultStatuses(userId)
  return requireFound(
    await TaskStatusModel.findOne({ userId, category }).sort({ order: 1, createdAt: 1 }).lean()
  )
}

/** Ids de los estados de una categoría (por ejemplo, para contar tareas terminadas). */
export async function getStatusIdsByCategory(
  userId: Types.ObjectId,
  category: StatusCategory
): Promise<Types.ObjectId[]> {
  await ensureDefaultStatuses(userId)
  const statuses = await TaskStatusModel.find({ userId, category }).select({ _id: 1 }).lean()
  return statuses.map((status) => status._id)
}

async function countTasksByStatus(userId: Types.ObjectId): Promise<Map<string, number>> {
  const rows = await TaskModel.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { userId } },
    { $group: { _id: '$statusId', count: { $sum: 1 } } }
  ])
  return new Map(rows.map((row) => [row._id.toString(), row.count]))
}

async function listForUser(userId: Types.ObjectId): Promise<TaskStatusDto[]> {
  await ensureDefaultStatuses(userId)
  const [statuses, counts] = await Promise.all([
    TaskStatusModel.find({ userId }).sort({ order: 1, createdAt: 1 }).lean(),
    countTasksByStatus(userId)
  ])
  return statuses.map((status) => toTaskStatusDto(status, counts.get(status._id.toString()) ?? 0))
}

function readStatusFields(data: Record<string, unknown>) {
  if (!isColor(data.color) || !isCategory(data.category)) {
    throw new AppError(ERROR_CODES.VALIDATION_FAILED)
  }
  return {
    name: requireText(data.name, FIELD_LIMITS.STATUS_NAME_MAX),
    color: data.color,
    category: data.category
  }
}

async function isLastInCategory(userId: Types.ObjectId, status: TaskStatusRecord) {
  const others = await TaskStatusModel.countDocuments({
    userId,
    category: status.category,
    _id: trusted({ $ne: status._id })
  })
  return others === 0
}

export async function listStatuses(): Promise<TaskStatusDto[]> {
  return listForUser(requireUserId())
}

export async function createStatus(raw: unknown): Promise<TaskStatusDto> {
  const userId = requireUserId()
  await ensureDefaultStatuses(userId)
  const fields = readStatusFields(requireObject(raw))
  const last = await TaskStatusModel.findOne({ userId }).sort({ order: -1 }).lean()
  const status = await TaskStatusModel.create({
    ...fields,
    userId,
    order: last ? last.order + 1 : 0
  })
  return toTaskStatusDto(status.toObject(), 0)
}

export async function updateStatus(raw: unknown): Promise<TaskStatusDto> {
  const userId = requireUserId()
  const data = requireObject(raw)
  const current = await findOwnedStatus(userId, requireObjectId(data.id))
  const fields = readStatusFields(data)

  const categoryChanged = fields.category !== current.category
  if (categoryChanged && (await isLastInCategory(userId, current))) {
    throw new AppError(ERROR_CODES.STATUS_LAST_IN_CATEGORY)
  }

  const updated = requireFound(
    await TaskStatusModel.findOneAndUpdate({ _id: current._id, userId }, fields, {
      new: true,
      runValidators: true
    }).lean()
  )

  // Si el estado deja de ser "en curso", sus cronómetros activos se detienen y acumulan.
  if (categoryChanged && current.category === STATUS_CATEGORIES.IN_PROGRESS) {
    const runningTasks = await TaskModel.find({
      userId,
      statusId: current._id,
      timerStartedAt: trusted({ $ne: null })
    })
    for (const task of runningTasks) {
      stopRunningTimer(task)
      await task.save()
    }
  }

  const taskCount = await TaskModel.countDocuments({ userId, statusId: current._id })
  return toTaskStatusDto(updated, taskCount)
}

/**
 * Elimina un estado. Sus tareas pasan al primer estado restante de la misma categoría,
 * así que el comportamiento del cronómetro no cambia.
 */
export async function deleteStatus(rawId: unknown): Promise<null> {
  const userId = requireUserId()
  const status = await findOwnedStatus(userId, requireObjectId(rawId))
  const replacement = await TaskStatusModel.findOne({
    userId,
    category: status.category,
    _id: trusted({ $ne: status._id })
  })
    .sort({ order: 1, createdAt: 1 })
    .lean()
  if (!replacement) throw new AppError(ERROR_CODES.STATUS_LAST_IN_CATEGORY)

  await TaskModel.updateMany({ userId, statusId: status._id }, { statusId: replacement._id })
  await TaskStatusModel.deleteOne({ _id: status._id, userId })
  return null
}

/** Reordena todos los estados del usuario según la lista de ids recibida. */
export async function reorderStatuses(raw: unknown): Promise<TaskStatusDto[]> {
  const userId = requireUserId()
  const { ids } = requireObject(raw)
  if (!Array.isArray(ids)) throw new AppError(ERROR_CODES.VALIDATION_FAILED)

  const statuses = await TaskStatusModel.find({ userId }).select({ _id: 1 }).lean()
  const ownedIds = new Set(statuses.map((status) => status._id.toString()))
  const requestedIds = ids.map((id) => requireObjectId(id).toString())
  const sameSet =
    requestedIds.length === ownedIds.size &&
    new Set(requestedIds).size === requestedIds.length &&
    requestedIds.every((id) => ownedIds.has(id))
  if (!sameSet) throw new AppError(ERROR_CODES.VALIDATION_FAILED)

  await TaskStatusModel.bulkWrite(
    requestedIds.map((id, order) => ({
      updateOne: { filter: { _id: requireObjectId(id), userId }, update: { $set: { order } } }
    }))
  )
  return listForUser(userId)
}
