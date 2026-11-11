import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'
import { THEME_MODES, THEME_MODE_VALUES, THEME_TEXTS, type ThemeMode } from '@shared/constants'
import { useThemeStore } from '../../stores/themeStore'
import { cn } from './cn'

const THEME_ICONS: Record<ThemeMode, LucideIcon> = {
  [THEME_MODES.LIGHT]: Sun,
  [THEME_MODES.DARK]: Moon,
  [THEME_MODES.SYSTEM]: Monitor
}

/** Variantes: iconos compactos (pantallas de acceso) o tarjetas con texto (Configuración). */
export const THEME_SWITCHER_VARIANTS = {
  COMPACT: 'compact',
  CARDS: 'cards'
} as const

type ThemeSwitcherVariant = (typeof THEME_SWITCHER_VARIANTS)[keyof typeof THEME_SWITCHER_VARIANTS]

interface ThemeSwitcherProps {
  variant?: ThemeSwitcherVariant
  className?: string
}

/** Selector de tema: claro, oscuro o el del sistema. La opción activa queda hundida. */
export function ThemeSwitcher({
  variant = THEME_SWITCHER_VARIANTS.COMPACT,
  className
}: ThemeSwitcherProps) {
  const mode = useThemeStore((state) => state.mode)
  const setMode = useThemeStore((state) => state.setMode)
  const cards = variant === THEME_SWITCHER_VARIANTS.CARDS

  return (
    <div
      role="radiogroup"
      aria-label={THEME_TEXTS.LABEL}
      className={cn(
        cards ? 'grid grid-cols-3 gap-4' : 'inline-flex gap-1 rounded-full p-1 shadow-neu-sm',
        className
      )}
    >
      {THEME_MODE_VALUES.map((option) => {
        const Icon = THEME_ICONS[option]
        const active = option === mode
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={THEME_TEXTS[option]}
            title={THEME_TEXTS[option]}
            onClick={() => !active && void setMode(option)}
            className={cn(
              'flex cursor-pointer items-center justify-center transition-all',
              cards
                ? 'flex-col gap-2 rounded-neu-sm px-4 py-5 text-sm font-semibold'
                : 'size-8 rounded-full',
              active
                ? cn('text-accent', cards ? 'shadow-neu-inset' : 'shadow-neu-inset-sm')
                : cn('text-muted hover:text-ink', cards && 'shadow-neu-sm hover:shadow-neu')
            )}
          >
            <Icon className={cards ? 'size-5' : 'size-4'} />
            {cards && THEME_TEXTS[option]}
          </button>
        )
      })}
    </div>
  )
}
