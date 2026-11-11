import { Navigate, Outlet } from 'react-router'
import { AUTH_STATUS, ROUTES } from '@shared/constants'
import { useAuthStore } from '../../stores/authStore'
import { LoadingState } from '../ui/LoadingState'

/** Solo deja pasar a usuarios autenticados. */
export function ProtectedRoute() {
  const status = useAuthStore((state) => state.status)
  if (status === AUTH_STATUS.LOADING) return <LoadingState />
  if (status === AUTH_STATUS.ANONYMOUS) return <Navigate to={ROUTES.LOGIN} replace />
  return <Outlet />
}

/** Solo deja pasar a usuarios sin sesión (login/registro). */
export function PublicOnlyRoute() {
  const status = useAuthStore((state) => state.status)
  if (status === AUTH_STATUS.LOADING) return <LoadingState />
  if (status === AUTH_STATUS.AUTHENTICATED) return <Navigate to={ROUTES.ENVIRONMENTS} replace />
  return <Outlet />
}
