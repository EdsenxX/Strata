/**
 * Entornos: agrupan proyectos de un mismo usuario (empresa, cliente, área personal…).
 */
import type { Types } from 'mongoose'
import { FIELD_LIMITS } from '@shared/constants'
import type { EnvironmentDto } from '@shared/types'
import { EnvironmentModel } from '../database/models/Environment'
import { PhaseModel } from '../database/models/Phase'
import { ProjectModel } from '../database/models/Project'
import { TaskModel } from '../database/models/Task'
import { TaskImageModel } from '../database/models/TaskImage'
import { requireUserId } from '../session/sessionStore'
import { requireFound, requireObject, requireObjectId, requireText } from '../utils/inputGuards'
import { toEnvironmentDto } from './mappers'

/** Busca un entorno del usuario actual o lanza NOT_FOUND. */
export async function findOwnedEnvironment(userId: Types.ObjectId, environmentId: Types.ObjectId) {
  return requireFound(await EnvironmentModel.findOne({ _id: environmentId, userId }).lean())
}

async function countProjects(environmentId: Types.ObjectId, userId: Types.ObjectId) {
  return ProjectModel.countDocuments({ environmentId, userId })
}

export async function listEnvironments(): Promise<EnvironmentDto[]> {
  const userId = requireUserId()
  const [environments, counts] = await Promise.all([
    EnvironmentModel.find({ userId }).sort({ createdAt: -1 }).lean(),
    ProjectModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { userId } },
      { $group: { _id: '$environmentId', count: { $sum: 1 } } }
    ])
  ])
  const countByEnvironment = new Map(counts.map((item) => [item._id.toString(), item.count]))
  return environments.map((environment) =>
    toEnvironmentDto(environment, countByEnvironment.get(environment._id.toString()) ?? 0)
  )
}

export async function getEnvironment(rawId: unknown): Promise<EnvironmentDto> {
  const userId = requireUserId()
  const environment = await findOwnedEnvironment(userId, requireObjectId(rawId))
  return toEnvironmentDto(environment, await countProjects(environment._id, userId))
}

export async function createEnvironment(raw: unknown): Promise<EnvironmentDto> {
  const userId = requireUserId()
  const data = requireObject(raw)
  const environment = await EnvironmentModel.create({
    userId,
    name: requireText(data.name, FIELD_LIMITS.ENTITY_NAME_MAX)
  })
  return toEnvironmentDto(environment.toObject(), 0)
}

export async function updateEnvironment(raw: unknown): Promise<EnvironmentDto> {
  const userId = requireUserId()
  const data = requireObject(raw)
  const environment = requireFound(
    await EnvironmentModel.findOneAndUpdate(
      { _id: requireObjectId(data.id), userId },
      { name: requireText(data.name, FIELD_LIMITS.ENTITY_NAME_MAX) },
      { new: true, runValidators: true }
    ).lean()
  )
  return toEnvironmentDto(environment, await countProjects(environment._id, userId))
}

/** Elimina el entorno y, en cascada, sus proyectos, fases y tareas. */
export async function deleteEnvironment(rawId: unknown): Promise<null> {
  const userId = requireUserId()
  const environment = await findOwnedEnvironment(userId, requireObjectId(rawId))
  const filter = { userId, environmentId: environment._id }
  await TaskImageModel.deleteMany(filter)
  await TaskModel.deleteMany(filter)
  await PhaseModel.deleteMany(filter)
  await ProjectModel.deleteMany(filter)
  await EnvironmentModel.deleteOne({ _id: environment._id, userId })
  return null
}
