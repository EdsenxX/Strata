/**
 * Conversión de documentos de MongoDB a DTOs serializables para la interfaz.
 */
import type {
  EnvironmentDto,
  PhaseDto,
  ProjectDto,
  TaskDto,
  TaskStatusDto,
  TaskSummaryDto,
  UserDto
} from '@shared/types'
import type { EnvironmentRecord } from '../database/models/Environment'
import type { PhaseRecord } from '../database/models/Phase'
import type { ProjectRecord } from '../database/models/Project'
import type { TaskRecord } from '../database/models/Task'
import type { TaskStatusRecord } from '../database/models/TaskStatus'
import type { UserRecord } from '../database/models/User'

const toIso = (date: Date): string => date.toISOString()

export function toUserDto(user: UserRecord): UserDto {
  return {
    id: user._id.toString(),
    firstNames: user.firstNames,
    paternalLastName: user.paternalLastName,
    maternalLastName: user.maternalLastName,
    email: user.email,
    username: user.username,
    createdAt: toIso(user.createdAt)
  }
}

export function toEnvironmentDto(
  environment: EnvironmentRecord,
  projectCount: number
): EnvironmentDto {
  return {
    id: environment._id.toString(),
    userId: environment.userId.toString(),
    name: environment.name,
    projectCount,
    createdAt: toIso(environment.createdAt),
    updatedAt: toIso(environment.updatedAt)
  }
}

export interface TaskCounts {
  taskCount: number
  completedTaskCount: number
}

export function toProjectDto(project: ProjectRecord, counts: TaskCounts): ProjectDto {
  return {
    id: project._id.toString(),
    environmentId: project.environmentId.toString(),
    name: project.name,
    description: project.description ?? '',
    taskCount: counts.taskCount,
    completedTaskCount: counts.completedTaskCount,
    createdAt: toIso(project.createdAt),
    updatedAt: toIso(project.updatedAt)
  }
}

export function toPhaseDto(phase: PhaseRecord, taskCount: number): PhaseDto {
  return {
    id: phase._id.toString(),
    projectId: phase.projectId.toString(),
    environmentId: phase.environmentId.toString(),
    name: phase.name,
    order: phase.order,
    taskCount,
    createdAt: toIso(phase.createdAt),
    updatedAt: toIso(phase.updatedAt)
  }
}

export function toTaskSummaryDto(task: TaskRecord): TaskSummaryDto {
  return {
    id: task._id.toString(),
    phaseId: task.phaseId.toString(),
    projectId: task.projectId.toString(),
    environmentId: task.environmentId.toString(),
    title: task.title,
    statusId: task.statusId.toString(),
    timeSpentSeconds: task.timeSpentSeconds ?? 0,
    timerStartedAt: task.timerStartedAt ? toIso(task.timerStartedAt) : null,
    createdAt: toIso(task.createdAt),
    updatedAt: toIso(task.updatedAt)
  }
}

export function toTaskStatusDto(status: TaskStatusRecord, taskCount: number): TaskStatusDto {
  return {
    id: status._id.toString(),
    name: status.name,
    color: status.color,
    category: status.category,
    order: status.order,
    taskCount,
    createdAt: toIso(status.createdAt),
    updatedAt: toIso(status.updatedAt)
  }
}

export function toTaskDto(task: TaskRecord): TaskDto {
  return { ...toTaskSummaryDto(task), content: task.content ?? '' }
}
