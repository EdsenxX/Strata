/**
 * Fases: etapas de un proyecto que agrupan sus tareas.
 */
import type { Types } from 'mongoose'
import { FIELD_LIMITS } from '@shared/constants'
import type { PhaseDto } from '@shared/types'
import { PhaseModel } from '../database/models/Phase'
import { TaskModel } from '../database/models/Task'
import { TaskImageModel } from '../database/models/TaskImage'
import { requireUserId } from '../session/sessionStore'
import { requireFound, requireObject, requireObjectId, requireText } from '../utils/inputGuards'
import { toPhaseDto, type PhaseStats } from './mappers'
import { findOwnedProject, touchProject } from './projectService'
import {
  EMPTY_TIME_TOTALS,
  TIME_TOTALS_ACCUMULATORS,
  toTimeTotals,
  type TimeTotalsRow
} from './timeTotals'

const EMPTY_STATS: PhaseStats = { taskCount: 0, ...EMPTY_TIME_TOTALS }

/** Cuenta tareas y suma su tiempo, agrupadas por fase. */
async function getStatsByPhase(
  userId: Types.ObjectId,
  match: Record<string, Types.ObjectId>
): Promise<Map<string, PhaseStats>> {
  const rows = await TaskModel.aggregate<
    { _id: Types.ObjectId; taskCount: number } & TimeTotalsRow
  >([
    { $match: { userId, ...match } },
    { $group: { _id: '$phaseId', taskCount: { $sum: 1 }, ...TIME_TOTALS_ACCUMULATORS } }
  ])
  return new Map(
    rows.map((row) => [row._id.toString(), { taskCount: row.taskCount, ...toTimeTotals(row) }])
  )
}

export async function findOwnedPhase(userId: Types.ObjectId, phaseId: Types.ObjectId) {
  return requireFound(await PhaseModel.findOne({ _id: phaseId, userId }).lean())
}

export async function listPhases(rawProjectId: unknown): Promise<PhaseDto[]> {
  const userId = requireUserId()
  const project = await findOwnedProject(userId, requireObjectId(rawProjectId))
  const [phases, stats] = await Promise.all([
    PhaseModel.find({ userId, projectId: project._id }).sort({ order: 1, createdAt: 1 }).lean(),
    getStatsByPhase(userId, { projectId: project._id })
  ])
  return phases.map((phase) => toPhaseDto(phase, stats.get(phase._id.toString()) ?? EMPTY_STATS))
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
  return toPhaseDto(phase.toObject(), EMPTY_STATS)
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
  const stats = await getStatsByPhase(userId, { phaseId: phase._id })
  return toPhaseDto(phase, stats.get(phase._id.toString()) ?? EMPTY_STATS)
}

/** Elimina la fase y sus tareas. */
export async function deletePhase(rawId: unknown): Promise<null> {
  const userId = requireUserId()
  const phase = await findOwnedPhase(userId, requireObjectId(rawId))
  await TaskImageModel.deleteMany({ userId, phaseId: phase._id })
  await TaskModel.deleteMany({ userId, phaseId: phase._id })
  await PhaseModel.deleteOne({ _id: phase._id, userId })
  await touchProject(userId, phase.projectId)
  return null
}
