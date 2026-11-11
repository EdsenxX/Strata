/**
 * Objetos de transferencia (DTO) que viajan del proceso principal a la interfaz.
 * Las fechas se serializan como cadenas ISO 8601.
 */
import type { TaskStatus } from '../constants/taskStatus'

export interface UserDto {
  id: string
  firstNames: string
  paternalLastName: string
  maternalLastName: string
  email: string
  username: string
  createdAt: string
}

export interface EnvironmentDto {
  id: string
  userId: string
  name: string
  projectCount: number
  createdAt: string
  updatedAt: string
}

export interface ProjectDto {
  id: string
  environmentId: string
  name: string
  description: string
  taskCount: number
  completedTaskCount: number
  createdAt: string
  updatedAt: string
}

export interface PhaseDto {
  id: string
  projectId: string
  environmentId: string
  name: string
  order: number
  taskCount: number
  createdAt: string
  updatedAt: string
}

export interface TaskDto {
  id: string
  phaseId: string
  projectId: string
  environmentId: string
  title: string
  /** Contenido de la tarea en Markdown. */
  content: string
  status: TaskStatus
  /** Tiempo acumulado (segundos) sin contar el tramo del cronómetro en curso. */
  timeSpentSeconds: number
  /** Momento en que se inició el cronómetro; `null` si está detenido. */
  timerStartedAt: string | null
  createdAt: string
  updatedAt: string
}

/** Versión ligera de la tarea para listados (sin el contenido Markdown). */
export type TaskSummaryDto = Omit<TaskDto, 'content'>
