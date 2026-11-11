import { NavLink, Outlet } from 'react-router'
import { FolderTree, LogOut } from 'lucide-react'
import { AUTH_TEXTS, NAV_TEXTS, ROUTES } from '@shared/constants'
import { useAuthStore } from '../../stores/authStore'
import { getDisplayName, getInitials } from '../../utils/format'
import { BUTTON_SIZES, BUTTON_VARIANTS, Button } from '../ui/Button'
import { cn } from '../ui/cn'
import { ThemeSwitcher } from '../ui/ThemeSwitcher'
import { VersionBadge } from '../ui/VersionBadge'
import { Logo } from './Logo'

/** Estructura de la app autenticada: barra lateral + contenido. */
export function AppShell() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <div className="flex h-full">
      <aside className="flex w-64 shrink-0 flex-col gap-8 p-6">
        <Logo />
        <nav className="flex flex-col gap-2">
          <NavLink
            to={ROUTES.ENVIRONMENTS}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-neu-sm px-4 py-3 text-sm font-semibold transition-all',
                isActive
                  ? 'text-accent shadow-neu-inset'
                  : 'text-muted hover:text-ink hover:shadow-neu-sm'
              )
            }
          >
            <FolderTree className="size-4" />
            {NAV_TEXTS.ENVIRONMENTS}
          </NavLink>
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          {user && (
            <div className="flex items-center gap-3 rounded-neu-sm p-3 shadow-neu-sm">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-accent shadow-neu-inset-sm">
                {getInitials(user)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{getDisplayName(user)}</p>
                <p className="truncate text-xs text-muted">@{user.username}</p>
              </div>
              <Button
                iconOnly
                size={BUTTON_SIZES.SM}
                variant={BUTTON_VARIANTS.GHOST}
                aria-label={AUTH_TEXTS.LOGOUT}
                title={AUTH_TEXTS.LOGOUT}
                icon={<LogOut className="size-4" />}
                onClick={() => void logout()}
              />
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <ThemeSwitcher />
            <VersionBadge />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto w-full max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
