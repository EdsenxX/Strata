/**
 * Rutas de la interfaz (HashRouter) y utilidades para construirlas.
 */
export const ROUTE_PARAMS = {
  ENVIRONMENT_ID: 'environmentId',
  PROJECT_ID: 'projectId',
  TASK_ID: 'taskId'
} as const

/** Parámetros de query string. */
export const QUERY_PARAMS = {
  PHASE: 'phase'
} as const

export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ENVIRONMENTS: '/environments',
  STATUSES: '/statuses',
  ENVIRONMENT: `/environments/:${ROUTE_PARAMS.ENVIRONMENT_ID}`,
  PROJECT: `/environments/:${ROUTE_PARAMS.ENVIRONMENT_ID}/projects/:${ROUTE_PARAMS.PROJECT_ID}`,
  TASK: `/environments/:${ROUTE_PARAMS.ENVIRONMENT_ID}/projects/:${ROUTE_PARAMS.PROJECT_ID}/tasks/:${ROUTE_PARAMS.TASK_ID}`
} as const

/** Construye rutas concretas a partir de los identificadores. */
export const buildRoute = {
  environment: (environmentId: string): string => `${ROUTES.ENVIRONMENTS}/${environmentId}`,
  project: (environmentId: string, projectId: string, phaseId?: string): string => {
    const base = `${buildRoute.environment(environmentId)}/projects/${projectId}`
    return phaseId ? `${base}?${QUERY_PARAMS.PHASE}=${phaseId}` : base
  },
  task: (environmentId: string, projectId: string, taskId: string): string =>
    `${buildRoute.environment(environmentId)}/projects/${projectId}/tasks/${taskId}`
}
