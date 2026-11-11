import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'
import { Spinner } from './Spinner'

/** Variantes visuales del botón neumórfico. */
export const BUTTON_VARIANTS = {
  NEUTRAL: 'neutral',
  PRIMARY: 'primary',
  DANGER: 'danger',
  GHOST: 'ghost'
} as const

export const BUTTON_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg'
} as const

type ButtonVariant = (typeof BUTTON_VARIANTS)[keyof typeof BUTTON_VARIANTS]
type ButtonSize = (typeof BUTTON_SIZES)[keyof typeof BUTTON_SIZES]

const variantClasses: Record<ButtonVariant, string> = {
  [BUTTON_VARIANTS.NEUTRAL]:
    'bg-base text-ink shadow-neu-sm hover:shadow-neu active:shadow-neu-inset-sm',
  [BUTTON_VARIANTS.PRIMARY]:
    'bg-accent text-accent-contrast shadow-neu-sm hover:shadow-neu hover:brightness-105 active:shadow-neu-inset-sm',
  [BUTTON_VARIANTS.DANGER]:
    'bg-base text-danger shadow-neu-sm hover:shadow-neu active:shadow-neu-inset-sm',
  [BUTTON_VARIANTS.GHOST]: 'bg-transparent text-muted hover:text-ink active:shadow-neu-inset-sm'
}

const sizeClasses: Record<ButtonSize, string> = {
  [BUTTON_SIZES.SM]: 'h-9 px-3 text-sm gap-1.5 rounded-xl',
  [BUTTON_SIZES.MD]: 'h-11 px-5 text-sm gap-2 rounded-neu-sm',
  [BUTTON_SIZES.LG]: 'h-13 px-6 text-base gap-2 rounded-neu-sm'
}

const iconOnlySizeClasses: Record<ButtonSize, string> = {
  [BUTTON_SIZES.SM]: 'size-9 rounded-xl',
  [BUTTON_SIZES.MD]: 'size-11 rounded-neu-sm',
  [BUTTON_SIZES.LG]: 'size-13 rounded-neu-sm'
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  loading?: boolean
  /** Botón cuadrado solo con icono; requiere `aria-label`. */
  iconOnly?: boolean
}

export function Button({
  variant = BUTTON_VARIANTS.NEUTRAL,
  size = BUTTON_SIZES.MD,
  icon,
  loading = false,
  iconOnly = false,
  type = 'button',
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      {!iconOnly && children}
    </button>
  )
}
