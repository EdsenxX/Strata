import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router'
import { ROUTES } from '@shared/constants'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute, PublicOnlyRoute } from './components/routing/RouteGuards'
import { EnvironmentDetailPage } from './pages/EnvironmentDetailPage'
import { EnvironmentsPage } from './pages/EnvironmentsPage'
import { LoginPage } from './pages/LoginPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { RegisterPage } from './pages/RegisterPage'
import { SettingsPage } from './pages/SettingsPage'
import { StatusesPage } from './pages/StatusesPage'
import { TaskDetailPage } from './pages/TaskDetailPage'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'
import { useUpdateStore } from './stores/updateStore'
import { UpdateBanner } from './components/layout/UpdateBanner'

/**
 * Raíz de la interfaz. Se usa HashRouter porque en producción la app se carga
 * desde `file://`, donde el historial basado en rutas no funciona.
 */
export function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap)
  const loadTheme = useThemeStore((state) => state.load)
  const initUpdates = useUpdateStore((state) => state.init)

  useEffect(() => {
    void bootstrap()
    void loadTheme()
    void initUpdates()
  }, [bootstrap, loadTheme, initUpdates])

  return (
    <HashRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path={ROUTES.ENVIRONMENTS} element={<EnvironmentsPage />} />
            <Route path={ROUTES.ENVIRONMENT} element={<EnvironmentDetailPage />} />
            <Route path={ROUTES.PROJECT} element={<ProjectDetailPage />} />
            <Route path={ROUTES.TASK} element={<TaskDetailPage />} />
            <Route path={ROUTES.STATUSES} element={<StatusesPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.ENVIRONMENTS} replace />} />
      </Routes>
      <UpdateBanner />
    </HashRouter>
  )
}
