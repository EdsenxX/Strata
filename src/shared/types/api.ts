/**
 * Contrato de la API que el preload expone en `window.strata`.
 */
import type { ErrorCode } from '../constants/errorCodes'
import type {
  EnvironmentDto,
  PhaseDto,
  ProjectDto,
  TaskDto,
  TaskSummaryDto,
  UserDto
} from './entities'
import type {
  CreateEnvironmentInput,
  CreatePhaseInput,
  CreateProjectInput,
  CreateTaskInput,
  LoginInput,
  RegisterInput,
  SetTaskTimeInput,
  UpdateEnvironmentInput,
  UpdatePhaseInput,
  UpdateProjectInput,
  UpdateTaskInput
} from './inputs'

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
}
