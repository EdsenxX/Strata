/**
 * Estados de tarea.
 *
 * Los estados son documentos de MongoDB que cada usuario administra (nombre, color, orden).
 * Lo que NO es configurable es su **categoría**, que define el comportamiento:
 * - `pending`: estado inicial de las tareas nuevas.
 * - `in_progress`: iniciar el cronómetro mueve la tarea aquí.
 * - `paused`: pausar el cronómetro mueve la tarea aquí.
 * - `completed`: cuenta como terminada en el avance del proyecto.
 * Cada categoría debe conservar al menos un estado.
 */
export const STATUS_CATEGORIES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  COMPLETED: 'completed'
} as const

export type StatusCategory = (typeof STATUS_CATEGORIES)[keyof typeof STATUS_CATEGORIES]

export const STATUS_CATEGORY_VALUES: readonly StatusCategory[] = [
  STATUS_CATEGORIES.PENDING,
  STATUS_CATEGORIES.IN_PROGRESS,
  STATUS_CATEGORIES.PAUSED,
  STATUS_CATEGORIES.COMPLETED
]

/** Paleta de colores disponible para los estados (se guarda la clave, no el color). */
export const STATUS_COLORS = {
  GRAY: 'gray',
  BLUE: 'blue',
  AMBER: 'amber',
  GREEN: 'green',
  VIOLET: 'violet',
  TEAL: 'teal',
  PINK: 'pink',
  RED: 'red'
} as const

export type StatusColor = (typeof STATUS_COLORS)[keyof typeof STATUS_COLORS]

export const STATUS_COLOR_VALUES: readonly StatusColor[] = Object.values(STATUS_COLORS)

export interface StatusSeed {
  name: string
  color: StatusColor
  category: StatusCategory
}

/** Estados con los que nace el catálogo de cada usuario. */
export const DEFAULT_TASK_STATUSES: readonly StatusSeed[] = [
  { name: 'Pendiente', color: STATUS_COLORS.GRAY, category: STATUS_CATEGORIES.PENDING },
  { name: 'En progreso', color: STATUS_COLORS.BLUE, category: STATUS_CATEGORIES.IN_PROGRESS },
  { name: 'En pausa', color: STATUS_COLORS.AMBER, category: STATUS_CATEGORIES.PAUSED },
  { name: 'Completada', color: STATUS_COLORS.GREEN, category: STATUS_CATEGORIES.COMPLETED }
]

/** Campo del esquema anterior (estado como texto) que se migra a `statusId`. */
export const LEGACY_TASK_STATUS_FIELD = 'status'
