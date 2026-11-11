import { Pause, Play } from 'lucide-react'
import { TASK_TEXTS } from '@shared/constants'
import { BUTTON_SIZES, BUTTON_VARIANTS, Button } from '../ui/Button'

interface TimerButtonProps {
  running: boolean
  loading?: boolean
  size?: (typeof BUTTON_SIZES)[keyof typeof BUTTON_SIZES]
  iconOnly?: boolean
  onToggle: () => void
}

/** Botón Iniciar/Pausar del cronómetro de una tarea. */
export function TimerButton({
  running,
  loading,
  size = BUTTON_SIZES.MD,
  iconOnly = false,
  onToggle
}: TimerButtonProps) {
  const label = running ? TASK_TEXTS.PAUSE_TIMER : TASK_TEXTS.START_TIMER
  const Icon = running ? Pause : Play
  return (
    <Button
      iconOnly={iconOnly}
      size={size}
      variant={running ? BUTTON_VARIANTS.NEUTRAL : BUTTON_VARIANTS.PRIMARY}
      loading={loading}
      aria-label={label}
      title={label}
      icon={<Icon className="size-4" />}
      onClick={(event) => {
        event.stopPropagation()
        onToggle()
      }}
    >
      {label}
    </Button>
  )
}
