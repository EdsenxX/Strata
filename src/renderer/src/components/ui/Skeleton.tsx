import { createContext, useContext, type ReactNode } from 'react'
import { COMMON_TEXTS } from '@shared/constants'
import { cn } from './cn'

/**
 * Bloque de carga neumórfico: superficie hundida que pulsa.
 * Se usa siempre en lugar de spinners para contenido que se está cargando.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-neu-sm bg-ink/5 shadow-neu-inset-sm', className)}
    />
  )
}

/** Indica si ya hay un SkeletonGroup más arriba (para no anunciar la carga dos veces). */
const InsideSkeletonGroup = createContext(false)

/** Contenedor de skeletons: anuncia la carga una sola vez a los lectores de pantalla. */
export function SkeletonGroup({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  const nested = useContext(InsideSkeletonGroup)
  if (nested) return <div className={className}>{children}</div>
  return (
    <InsideSkeletonGroup.Provider value>
      <div role="status" aria-busy="true" aria-label={COMMON_TEXTS.LOADING} className={className}>
        {children}
      </div>
    </InsideSkeletonGroup.Provider>
  )
}
