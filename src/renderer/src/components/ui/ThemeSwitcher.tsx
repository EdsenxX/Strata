import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'
import { THEME_MODES, THEME_MODE_VALUES, THEME_TEXTS, type ThemeMode } from '@shared/constants'
import { useThemeStore } from '../../stores/themeStore'
import { cn } from './cn'

const THEME_ICONS: Record<ThemeMode, LucideIcon> = {
  [THEME_MODES.LIGHT]: Sun,
  [THEME_MODES.DARK]: Moon,
  [THEME_MODES.SYSTEM]: Monitor
}

/** Selector de tema: claro, oscuro o el del sistema. La opción activa queda hundida. */
export function ThemeSwitcher({ className }: { className?: string }) {
  const mode = useThemeStore((state) => state.mode)
  const setMode = useThemeStore((state) => state.setMode)

  return (
    <div
      role="radiogroup"
      aria-label={THEME_TEXTS.LABEL}
      className={cn('inline-flex gap-1 rounded-full p-1 shadow-neu-sm', className)}
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
              'flex size-8 cursor-pointer items-center justify-center rounded-full transition-all',
              active ? 'text-accent shadow-neu-inset-sm' : 'text-muted hover:text-ink'
            )}
          >
            <Icon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}
