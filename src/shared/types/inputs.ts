/**
 * Datos de entrada que la interfaz envía al proceso principal.
 */
import type { StatusCategory, StatusColor } from '../constants/taskStatus'

export interface RegisterInput {
  firstNames: string
  paternalLastName: string
  maternalLastName: string
  email: string
  username: string
  password: string
  passwordConfirmation: string
}

export interface LoginInput {
  /** Correo o nombre de usuario. */
  identifier: string
  password: string
}

export interface CreateEnvironmentInput {
  name: string
}

export interface UpdateEnvironmentInput {
  id: string
  name: string
}

export interface CreateProjectInput {
  environmentId: string
  name: string
  description: string
}

export interface UpdateProjectInput {
  id: string
  name: string
  description: string
}

export interface CreatePhaseInput {
  projectId: string
  name: string
}

export interface UpdatePhaseInput {
  id: string
  name: string
}

export interface CreateTaskInput {
  phaseId: string
  title: string
}

export interface UpdateTaskInput {
  id: string
  title?: string
  content?: string
  statusId?: string
}

export interface SetTaskTimeInput {
  id: string
  timeSpentSeconds: number
}

export interface UploadImageInput {
  taskId: string
  mimeType: string
  /** Bytes de la imagen (ya optimizada en la interfaz). */
  data: Uint8Array
}

export interface CreateStatusInput {
  name: string
  color: StatusColor
  category: StatusCategory
}

export interface UpdateStatusInput extends CreateStatusInput {
  id: string
}

/** Ids de todos los estados del usuario en el nuevo orden. */
export interface ReorderStatusesInput {
  ids: string[]
}
