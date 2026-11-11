import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router'
import { FolderTree, ListChecks, LogOut, Settings } from 'lucide-react'
import { AUTH_TEXTS, NAV_TEXTS, ROUTES } from '@shared/constants'
import { useAuthStore } from '../../stores/authStore'
import { useStatusStore } from '../../stores/statusStore'
import { getDisplayName, getInitials } from '../../utils/format'
import { BUTTON_SIZES, BUTTON_VARIANTS, Button } from '../ui/Button'
import { cn } from '../ui/cn'
import { ErrorBanner } from '../ui/ErrorBanner'
import { VersionBadge } from '../ui/VersionBadge'
import { Logo } from './Logo'

const NAV_ITEMS = [
  { to: ROUTES.ENVIRONMENTS, label: NAV_TEXTS.ENVIRONMENTS, Icon: FolderTree },
  { to: ROUTES.STATUSES, label: NAV_TEXTS.STATUSES, Icon: ListChecks },
  { to: ROUTES.SETTINGS, label: NAV_TEXTS.SETTINGS, Icon: Settings }
]

/**
 * Estructura de la app autenticada: barra lateral + contenido.
 * Carga el catálogo de estados del usuario; mientras llega, StatusBadge y StatusSelector muestran skeletons.
 */
export function AppShell() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const statuses = useStatusStore((state) => state.statuses)
  const statusError = useStatusStore((state) => state.error)
  const loadStatuses = useStatusStore((state) => state.load)

  useEffect(() => {
    void loadStatuses()
  }, [loadStatuses])

  const content = (
    <>
      {!statuses && statusError && (
        <div className="mb-6">
          <ErrorBanner message={statusError} onRetry={() => void loadStatuses()} />
        </div>
      )}
      <Outlet />
    </>
  )

  return (
    <div className="flex h-full">
      <aside className="flex w-64 shrink-0 flex-col gap-8 p-6">
        <Logo />
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-neu-sm px-4 py-3 text-sm font-semibold transition-all',
                  isActive
                    ? 'text-accent shadow-neu-inset'
                    : 'text-muted hover:text-ink hover:shadow-neu-sm'
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
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
          <VersionBadge className="self-start" />
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto w-full max-w-6xl">{content}</div>
      </main>
    </div>
  )
}
