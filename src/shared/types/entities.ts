/**
 * Objetos de transferencia (DTO) que viajan del proceso principal a la interfaz.
 * Las fechas se serializan como cadenas ISO 8601.
 */
import type { StatusCategory, StatusColor } from '../constants/taskStatus'

export interface UserDto {
  id: string
  firstNames: string
  paternalLastName: string
  maternalLastName: string
  email: string
  username: string
  createdAt: string
}

/** Tiempo acumulado de un grupo de tareas (fase o proyecto). */
export interface TimeTotals {
  /** Suma de los tramos ya cerrados de todas sus tareas. */
  timeSpentSeconds: number
  /** Inicio (ISO) de cada cronómetro en marcha, para sumar su tramo en vivo. */
  runningTimerStartedAts: string[]
}

export interface EnvironmentDto {
  id: string
  userId: string
  name: string
  projectCount: number
  createdAt: string
  updatedAt: string
}

export interface ProjectDto extends TimeTotals {
  id: string
  environmentId: string
  name: string
  description: string
  taskCount: number
  completedTaskCount: number
  createdAt: string
  updatedAt: string
}

export interface PhaseDto extends TimeTotals {
  id: string
  projectId: string
  environmentId: string
  name: string
  order: number
  taskCount: number
  createdAt: string
  updatedAt: string
}

/** Estado de tarea configurable por el usuario. */
export interface TaskStatusDto {
  id: string
  name: string
  color: StatusColor
  category: StatusCategory
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
  /** Id del estado (documento de la colección de estados del usuario). */
  statusId: string
  /** Tiempo acumulado (segundos) sin contar el tramo del cronómetro en curso. */
  timeSpentSeconds: number
  /** Momento en que se inició el cronómetro; `null` si está detenido. */
  timerStartedAt: string | null
  createdAt: string
  updatedAt: string
}

/** Versión ligera de la tarea para listados (sin el contenido Markdown). */
export type TaskSummaryDto = Omit<TaskDto, 'content'>
