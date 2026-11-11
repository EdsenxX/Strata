import type { ReactNode } from 'react'
import { COMMON_TEXTS } from '@shared/constants'
import { ThemeSwitcher } from '../ui/ThemeSwitcher'
import { VersionBadge } from '../ui/VersionBadge'
import { Logo } from './Logo'

/** Contenedor de las pantallas públicas (login y registro). */
export function AuthLayout({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    // El contenedor externo es la zona desplazable (solo si la ventana es más chica que el layout).
    <div className="h-full overflow-y-auto">
      <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 py-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo />
          <p className="text-sm text-muted">{COMMON_TEXTS.APP_TAGLINE}</p>
        </div>
        <main className={wide ? 'w-full max-w-3xl' : 'w-full max-w-md'}>{children}</main>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <VersionBadge />
        </div>
      </div>
    </div>
  )
}
