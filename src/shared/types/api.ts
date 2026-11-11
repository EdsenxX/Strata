/**
 * Contrato de la API que el preload expone en `window.strata`.
 */
import type { ErrorCode } from '../constants/errorCodes'
import type { ThemeMode } from '../constants/preferences'
import type { UpdateStatus } from '../constants/updates'
import type {
  EnvironmentDto,
  PhaseDto,
  ProjectDto,
  TaskDto,
  TaskStatusDto,
  TaskSummaryDto,
  UserDto
} from './entities'
import type {
  CreateEnvironmentInput,
  CreatePhaseInput,
  CreateProjectInput,
  CreateStatusInput,
  CreateTaskInput,
  LoginInput,
  RegisterInput,
  ReorderStatusesInput,
  SetTaskTimeInput,
  UpdateEnvironmentInput,
  UpdatePhaseInput,
  UpdateProjectInput,
  UpdateStatusInput,
  UpdateTaskInput
} from './inputs'

/** Estado del ciclo de actualización (ver UPDATE_STATUS). */
export interface UpdateState {
  status: UpdateStatus
  currentVersion: string
  /** Versión nueva encontrada (si la hay). */
  availableVersion: string | null
  /** Porcentaje de descarga (0–100). */
  progress: number
  /** Fecha ISO de la última búsqueda terminada. */
  lastCheckedAt: string | null
}

/** Resultado de toda llamada IPC: nunca se lanzan excepciones a través del puente. */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ErrorCode }

type Call<TInput, TOutput> = (input: TInput) => Promise<ApiResult<TOutput>>
type CallWithoutInput<TOutput> = () => Promise<ApiResult<TOutput>>

export interface StrataApi {
  auth: {
    register: Call<RegisterInput, UserDto>
    login: Call<LoginInput, UserDto>
    logout: CallWithoutInput<null>
    getSession: CallWithoutInput<UserDto | null>
  }
  environments: {
    list: CallWithoutInput<EnvironmentDto[]>
    get: Call<string, EnvironmentDto>
    create: Call<CreateEnvironmentInput, EnvironmentDto>
    update: Call<UpdateEnvironmentInput, EnvironmentDto>
    remove: Call<string, null>
  }
  projects: {
    list: Call<string, ProjectDto[]>
    get: Call<string, ProjectDto>
    create: Call<CreateProjectInput, ProjectDto>
    update: Call<UpdateProjectInput, ProjectDto>
    remove: Call<string, null>
  }
  phases: {
    list: Call<string, PhaseDto[]>
    create: Call<CreatePhaseInput, PhaseDto>
    update: Call<UpdatePhaseInput, PhaseDto>
    remove: Call<string, null>
  }
  tasks: {
    list: Call<string, TaskSummaryDto[]>
    get: Call<string, TaskDto>
    create: Call<CreateTaskInput, TaskDto>
    update: Call<UpdateTaskInput, TaskDto>
    remove: Call<string, null>
    startTimer: Call<string, TaskDto>
    pauseTimer: Call<string, TaskDto>
    setTime: Call<SetTaskTimeInput, TaskDto>
  }
  statuses: {
    list: CallWithoutInput<TaskStatusDto[]>
    create: Call<CreateStatusInput, TaskStatusDto>
    update: Call<UpdateStatusInput, TaskStatusDto>
    remove: Call<string, null>
    reorder: Call<ReorderStatusesInput, TaskStatusDto[]>
  }
  preferences: {
    getTheme: CallWithoutInput<ThemeMode>
    setTheme: Call<ThemeMode, ThemeMode>
    getAutoDownloadUpdates: CallWithoutInput<boolean>
    setAutoDownloadUpdates: Call<boolean, boolean>
  }
  updates: {
    getState: CallWithoutInput<UpdateState>
    check: CallWithoutInput<UpdateState>
    download: CallWithoutInput<UpdateState>
    install: CallWithoutInput<null>
    /** Se suscribe a los cambios de estado; devuelve la función para desuscribirse. */
    onStateChange: (listener: (state: UpdateState) => void) => () => void
  }
}
