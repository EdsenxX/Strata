/**
 * Proyectos: viven dentro de un entorno y se dividen en fases.
 */
import type { Types } from 'mongoose'
import { FIELD_LIMITS, STATUS_CATEGORIES } from '@shared/constants'
import type { ProjectDto } from '@shared/types'
import { PhaseModel } from '../database/models/Phase'
import { ProjectModel } from '../database/models/Project'
import { TaskModel } from '../database/models/Task'
import { TaskImageModel } from '../database/models/TaskImage'
import { requireUserId } from '../session/sessionStore'
import {
  optionalText,
  requireFound,
  requireObject,
  requireObjectId,
  requireText
} from '../utils/inputGuards'
import { findOwnedEnvironment } from './environmentService'
import { toProjectDto, type TaskCounts } from './mappers'
import {
  EMPTY_TIME_TOTALS,
  TIME_TOTALS_ACCUMULATORS,
  toTimeTotals,
  type TimeTotalsRow
} from './timeTotals'
import { getStatusIdsByCategory } from './statusService'

const EMPTY_COUNTS: TaskCounts = { taskCount: 0, completedTaskCount: 0, ...EMPTY_TIME_TOTALS }

export async function findOwnedProject(userId: Types.ObjectId, projectId: Types.ObjectId) {
  return requireFound(await ProjectModel.findOne({ _id: projectId, userId }).lean())
}

/** Cuenta tareas (totales y completadas) y suma su tiempo, agrupadas por proyecto. */
async function countTasksByProject(
  userId: Types.ObjectId,
  projectIds: Types.ObjectId[]
): Promise<Map<string, TaskCounts>> {
  const completedStatusIds = await getStatusIdsByCategory(userId, STATUS_CATEGORIES.COMPLETED)
  const rows = await TaskModel.aggregate<
    { _id: Types.ObjectId; taskCount: number; completedTaskCount: number } & TimeTotalsRow
  >([
    { $match: { userId, projectId: { $in: projectIds } } },
    {
      $group: {
        _id: '$projectId',
        taskCount: { $sum: 1 },
        completedTaskCount: {
          $sum: { $cond: [{ $in: ['$statusId', completedStatusIds] }, 1, 0] }
        },
        ...TIME_TOTALS_ACCUMULATORS
      }
    }
  ])
  return new Map(
    rows.map((row) => [
      row._id.toString(),
      {
        taskCount: row.taskCount,
        completedTaskCount: row.completedTaskCount,
        ...toTimeTotals(row)
      }
    ])
  )
}

async function toDtoWithCounts(
  userId: Types.ObjectId,
  project: Parameters<typeof toProjectDto>[0]
) {
  const counts = await countTasksByProject(userId, [project._id])
  return toProjectDto(project, counts.get(project._id.toString()) ?? EMPTY_COUNTS)
}

/** Lista los proyectos de un entorno, del más reciente al más antiguo. */
export async function listProjects(rawEnvironmentId: unknown): Promise<ProjectDto[]> {
  const userId = requireUserId()
  const environment = await findOwnedEnvironment(userId, requireObjectId(rawEnvironmentId))
  const projects = await ProjectModel.find({ userId, environmentId: environment._id })
    .sort({ createdAt: -1 })
    .lean()
  const counts = await countTasksByProject(
    userId,
    projects.map((project) => project._id)
  )
  return projects.map((project) =>
    toProjectDto(project, counts.get(project._id.toString()) ?? EMPTY_COUNTS)
  )
}

export async function getProject(rawId: unknown): Promise<ProjectDto> {
  const userId = requireUserId()
  return toDtoWithCounts(userId, await findOwnedProject(userId, requireObjectId(rawId)))
}

export async function createProject(raw: unknown): Promise<ProjectDto> {
  const userId = requireUserId()
  const data = requireObject(raw)
  const environment = await findOwnedEnvironment(userId, requireObjectId(data.environmentId))
  const project = await ProjectModel.create({
    userId,
    environmentId: environment._id,
    name: requireText(data.name, FIELD_LIMITS.ENTITY_NAME_MAX),
    description: optionalText(data.description, FIELD_LIMITS.DESCRIPTION_MAX)
  })
  return toProjectDto(project.toObject(), EMPTY_COUNTS)
}

export async function updateProject(raw: unknown): Promise<ProjectDto> {
  const userId = requireUserId()
  const data = requireObject(raw)
  const project = requireFound(
    await ProjectModel.findOneAndUpdate(
      { _id: requireObjectId(data.id), userId },
      {
        name: requireText(data.name, FIELD_LIMITS.ENTITY_NAME_MAX),
        description: optionalText(data.description, FIELD_LIMITS.DESCRIPTION_MAX)
      },
      { new: true, runValidators: true }
    ).lean()
  )
  return toDtoWithCounts(userId, project)
}

/** Elimina el proyecto y, en cascada, sus fases y tareas. */
export async function deleteProject(rawId: unknown): Promise<null> {
  const userId = requireUserId()
  const project = await findOwnedProject(userId, requireObjectId(rawId))
  await TaskImageModel.deleteMany({ userId, projectId: project._id })
  await TaskModel.deleteMany({ userId, projectId: project._id })
  await PhaseModel.deleteMany({ userId, projectId: project._id })
  await ProjectModel.deleteOne({ _id: project._id, userId })
  return null
}

/** Marca el proyecto como editado (por ejemplo, al cambiar sus fases o tareas). */
export async function touchProject(
  userId: Types.ObjectId,
  projectId: Types.ObjectId
): Promise<void> {
  await ProjectModel.updateOne({ _id: projectId, userId }, { $set: { updatedAt: new Date() } })
}
