import { STATUS_COLORS, type StatusColor } from '@shared/constants'

/**
 * Clases de Tailwind por color de estado. Deben ser literales para que Tailwind las genere.
 * Los colores semánticos reutilizan los tokens del tema (claro/oscuro).
 */
export const STATUS_COLOR_CLASSES: Record<StatusColor, { text: string; dot: string }> = {
  [STATUS_COLORS.GRAY]: { text: 'text-muted', dot: 'bg-muted' },
  [STATUS_COLORS.BLUE]: { text: 'text-info', dot: 'bg-info' },
  [STATUS_COLORS.AMBER]: { text: 'text-warning', dot: 'bg-warning' },
  [STATUS_COLORS.GREEN]: { text: 'text-success', dot: 'bg-success' },
  [STATUS_COLORS.VIOLET]: { text: 'text-accent', dot: 'bg-accent' },
  [STATUS_COLORS.TEAL]: { text: 'text-teal-500', dot: 'bg-teal-500' },
  [STATUS_COLORS.PINK]: { text: 'text-pink-500', dot: 'bg-pink-500' },
  [STATUS_COLORS.RED]: { text: 'text-danger', dot: 'bg-danger' }
}
