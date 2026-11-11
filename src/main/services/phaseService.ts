/**
 * Fases: etapas de un proyecto que agrupan sus tareas.
 */
import type { Types } from 'mongoose'
import { FIELD_LIMITS } from '@shared/constants'
import type { PhaseDto } from '@shared/types'
import { PhaseModel } from '../database/models/Phase'
import { TaskModel } from '../database/models/Task'
import { requireUserId } from '../session/sessionStore'
import { requireFound, requireObject, requireObjectId, requireText } from '../utils/inputGuards'
import { toPhaseDto } from './mappers'
import { findOwnedProject, touchProject } from './projectService'

export async function findOwnedPhase(userId: Types.ObjectId, phaseId: Types.ObjectId) {
  return requireFound(await PhaseModel.findOne({ _id: phaseId, userId }).lean())
}

export async function listPhases(rawProjectId: unknown): Promise<PhaseDto[]> {
  const userId = requireUserId()
  const project = await findOwnedProject(userId, requireObjectId(rawProjectId))
  const [phases, counts] = await Promise.all([
    PhaseModel.find({ userId, projectId: project._id }).sort({ order: 1, createdAt: 1 }).lean(),
    TaskModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { userId, projectId: project._id } },
      { $group: { _id: '$phaseId', count: { $sum: 1 } } }
    ])
  ])
  const countByPhase = new Map(counts.map((item) => [item._id.toString(), item.count]))
  return phases.map((phase) => toPhaseDto(phase, countByPhase.get(phase._id.toString()) ?? 0))
}

export async function createPhase(raw: unknown): Promise<PhaseDto> {
  const userId = requireUserId()
  const data = requireObject(raw)
  const project = await findOwnedProject(userId, requireObjectId(data.projectId))
  const lastPhase = await PhaseModel.findOne({ userId, projectId: project._id })
    .sort({ order: -1 })
    .lean()
  const phase = await PhaseModel.create({
    userId,
    environmentId: project.environmentId,
    projectId: project._id,
    name: requireText(data.name, FIELD_LIMITS.ENTITY_NAME_MAX),
    order: lastPhase ? lastPhase.order + 1 : 0
  })
  await touchProject(userId, project._id)
  return toPhaseDto(phase.toObject(), 0)
}

export async function updatePhase(raw: unknown): Promise<PhaseDto> {
  const userId = requireUserId()
  const data = requireObject(raw)
  const phase = requireFound(
    await PhaseModel.findOneAndUpdate(
      { _id: requireObjectId(data.id), userId },
      { name: requireText(data.name, FIELD_LIMITS.ENTITY_NAME_MAX) },
      { new: true, runValidators: true }
    ).lean()
  )
  await touchProject(userId, phase.projectId)
  return toPhaseDto(phase, await TaskModel.countDocuments({ userId, phaseId: phase._id }))
}

/** Elimina la fase y sus tareas. */
export async function deletePhase(rawId: unknown): Promise<null> {
  const userId = requireUserId()
  const phase = await findOwnedPhase(userId, requireObjectId(rawId))
  await TaskModel.deleteMany({ userId, phaseId: phase._id })
  await PhaseModel.deleteOne({ _id: phase._id, userId })
  await touchProject(userId, phase.projectId)
  return null
}
