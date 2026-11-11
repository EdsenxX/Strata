import { useCallback, useState, type FormEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { ChevronRight, ListPlus, ListTodo, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  ASYNC_STATUS,
  COMMON_TEXTS,
  FIELD_LIMITS,
  KEYS,
  NAV_TEXTS,
  PHASE_TEXTS,
  PROJECT_TEXTS,
  QUERY_PARAMS,
  ROUTES,
  ROUTE_PARAMS,
  TASK_FILTER_ALL,
  TASK_STATUS_LABELS,
  TASK_STATUS_VALUES,
  TASK_TEXTS,
  buildRoute,
  type TaskStatus
} from '@shared/constants'
import type { PhaseDto, TaskDto, TaskSummaryDto } from '@shared/types'
import { api, getErrorMessage, unwrap } from '../api/client'
import { NameFormModal } from '../components/forms/NameFormModal'
import { ProjectFormModal, type ProjectFormValues } from '../components/forms/ProjectFormModal'
import { PageHeader } from '../components/layout/PageHeader'
import { ElapsedTime } from '../components/tasks/ElapsedTime'
import { TimerButton } from '../components/tasks/TimerButton'
import { BUTTON_SIZES, BUTTON_VARIANTS, Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { LoadingState } from '../components/ui/LoadingState'
import { StatusBadge } from '../components/ui/StatusBadge'
import { insetFieldClasses } from '../components/ui/TextField'
import { cn } from '../components/ui/cn'
import { useAsyncData } from '../hooks/useAsyncData'
import { formatDate } from '../utils/format'

type TaskFilter = TaskStatus | typeof TASK_FILTER_ALL

const toSummary = ({ content: _content, ...summary }: TaskDto): TaskSummaryDto => summary

export function ProjectDetailPage() {
  const params = useParams()
  const environmentId = params[ROUTE_PARAMS.ENVIRONMENT_ID] ?? ''
  const projectId = params[ROUTE_PARAMS.PROJECT_ID] ?? ''
  const [searchParams, setSearchParams] = useSearchParams()

  const loadData = useCallback(async () => {
    const [environment, project, phases] = await Promise.all([
      unwrap(api.environments.get(environmentId)),
      unwrap(api.projects.get(projectId)),
      unwrap(api.phases.list(projectId))
    ])
    return { environment, project, phases }
  }, [environmentId, projectId])
  const data = useAsyncData(loadData)

  const [editingProject, setEditingProject] = useState(false)
  const [creatingPhase, setCreatingPhase] = useState(false)
  const [renamingPhase, setRenamingPhase] = useState<PhaseDto | null>(null)
  const [deletingPhase, setDeletingPhase] = useState<PhaseDto | null>(null)

  if (data.status === ASYNC_STATUS.LOADING) return <LoadingState />
  if (data.status === ASYNC_STATUS.ERROR)
    return <ErrorBanner message={data.error} onRetry={data.reload} />

  const { environment, project, phases } = data.data
  const requestedPhaseId = searchParams.get(QUERY_PARAMS.PHASE)
  const activePhase = phases.find((phase) => phase.id === requestedPhaseId) ?? phases[0] ?? null

  const selectPhase = (phaseId: string) =>
    setSearchParams({ [QUERY_PARAMS.PHASE]: phaseId }, { replace: true })

  const updatePhases = (updater: (phases: PhaseDto[]) => PhaseDto[]) =>
    data.setData((current) => ({ ...current, phases: updater(current.phases) }))

  const updateProject = async (values: ProjectFormValues) => {
    const updated = await unwrap(api.projects.update({ id: projectId, ...values }))
    data.setData((current) => ({ ...current, project: updated }))
  }

  const createPhase = async (name: string) => {
    const created = await unwrap(api.phases.create({ projectId, name }))
    updatePhases((current) => [...current, created])
    selectPhase(created.id)
  }

  const renamePhase = async (name: string) => {
    if (!renamingPhase) return
    const updated = await unwrap(api.phases.update({ id: renamingPhase.id, name }))
    updatePhases((current) => current.map((phase) => (phase.id === updated.id ? updated : phase)))
  }

  const deletePhase = async () => {
    if (!deletingPhase) return
    await unwrap(api.phases.remove(deletingPhase.id))
    updatePhases((current) => current.filter((phase) => phase.id !== deletingPhase.id))
    setSearchParams({}, { replace: true })
  }

  const changeTaskCount = (phaseId: string, delta: number) =>
    updatePhases((current) =>
      current.map((phase) =>
        phase.id === phaseId ? { ...phase, taskCount: phase.taskCount + delta } : phase
      )
    )

  return (
    <>
      <PageHeader
        title={project.name}
        subtitle={project.description || COMMON_TEXTS.NO_DESCRIPTION}
        breadcrumbs={[
          { label: NAV_TEXTS.ENVIRONMENTS, to: ROUTES.ENVIRONMENTS },
          { label: environment.name, to: buildRoute.environment(environmentId) },
          { label: project.name }
        ]}
        actions={
          <Button icon={<Pencil className="size-4" />} onClick={() => setEditingProject(true)}>
            {PROJECT_TEXTS.EDIT_TITLE}
          </Button>
        }
      />

      <section className="mb-8">
        <h2 className="mb-4 text-xs font-bold tracking-wider text-muted uppercase">
          {PHASE_TEXTS.SECTION_TITLE}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {phases.map((phase) => {
            const active = phase.id === activePhase?.id
            return (
              <button
                key={phase.id}
                type="button"
                aria-pressed={active}
                onClick={() => selectPhase(phase.id)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-neu-sm px-4 py-2.5 text-sm font-semibold transition-all',
                  active
                    ? 'text-accent shadow-neu-inset'
                    : 'text-muted shadow-neu-sm hover:text-ink'
                )}
              >
                {phase.name}
                <span className="rounded-full px-2 py-0.5 font-mono text-[11px] shadow-neu-inset-sm">
                  {phase.taskCount}
                </span>
              </button>
            )
          })}
          <Button
            variant={BUTTON_VARIANTS.GHOST}
            icon={<Plus className="size-4" />}
            onClick={() => setCreatingPhase(true)}
          >
            {PHASE_TEXTS.NEW}
          </Button>
        </div>
      </section>

      {activePhase ? (
        <PhaseTasks
          key={activePhase.id}
          phase={activePhase}
          environmentId={environmentId}
          onRename={() => setRenamingPhase(activePhase)}
          onDelete={() => setDeletingPhase(activePhase)}
          onTaskCountChange={(delta) => changeTaskCount(activePhase.id, delta)}
        />
      ) : (
        <Card>
          <EmptyState
            icon={<ListPlus className="size-7" />}
            title={PHASE_TEXTS.EMPTY_TITLE}
            description={PHASE_TEXTS.EMPTY_BODY}
            action={
              <Button
                variant={BUTTON_VARIANTS.PRIMARY}
                icon={<Plus className="size-4" />}
                onClick={() => setCreatingPhase(true)}
              >
                {PHASE_TEXTS.NEW}
              </Button>
            }
          />
        </Card>
      )}

      <ProjectFormModal
        open={editingProject}
        title={PROJECT_TEXTS.EDIT_TITLE}
        initialValues={{ name: project.name, description: project.description }}
        onSubmit={updateProject}
        onClose={() => setEditingProject(false)}
      />
      <NameFormModal
        open={creatingPhase}
        title={PHASE_TEXTS.CREATE_TITLE}
        label={PHASE_TEXTS.NAME_LABEL}
        placeholder={PHASE_TEXTS.NAME_PLACEHOLDER}
        submitLabel={COMMON_TEXTS.CREATE}
        onSubmit={createPhase}
        onClose={() => setCreatingPhase(false)}
      />
      <NameFormModal
        open={renamingPhase !== null}
        title={PHASE_TEXTS.RENAME_TITLE}
        label={PHASE_TEXTS.NAME_LABEL}
        initialValue={renamingPhase?.name}
        onSubmit={renamePhase}
        onClose={() => setRenamingPhase(null)}
      />
      <ConfirmDialog
        open={deletingPhase !== null}
        title={PHASE_TEXTS.DELETE_TITLE}
        description={deletingPhase ? PHASE_TEXTS.DELETE_BODY(deletingPhase.name) : ''}
        onConfirm={deletePhase}
        onClose={() => setDeletingPhase(null)}
      />
    </>
  )
}

interface PhaseTasksProps {
  phase: PhaseDto
  environmentId: string
  onRename: () => void
  onDelete: () => void
  onTaskCountChange: (delta: number) => void
}

/** Lista de tareas de la fase activa: alta rápida, filtro por estado y cronómetro. */
function PhaseTasks({
  phase,
  environmentId,
  onRename,
  onDelete,
  onTaskCountChange
}: PhaseTasksProps) {
  const navigate = useNavigate()
  const loadTasks = useCallback(() => unwrap(api.tasks.list(phase.id)), [phase.id])
  const tasks = useAsyncData(loadTasks)
  const [filter, setFilter] = useState<TaskFilter>(TASK_FILTER_ALL)
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const replaceTask = (updated: TaskDto) =>
    tasks.setData((current) =>
      current.map((task) => (task.id === updated.id ? toSummary(updated) : task))
    )

  const createTask = async (event: FormEvent) => {
    event.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    setCreating(true)
    setActionError(null)
    try {
      const created = await unwrap(api.tasks.create({ phaseId: phase.id, title }))
      tasks.setData((current) => [toSummary(created), ...current])
      onTaskCountChange(1)
      setNewTitle('')
    } catch (caught) {
      setActionError(getErrorMessage(caught))
    } finally {
      setCreating(false)
    }
  }

  const toggleTimer = async (task: TaskSummaryDto) => {
    setBusyTaskId(task.id)
    setActionError(null)
    try {
      const request = task.timerStartedAt
        ? api.tasks.pauseTimer(task.id)
        : api.tasks.startTimer(task.id)
      replaceTask(await unwrap(request))
    } catch (caught) {
      setActionError(getErrorMessage(caught))
    } finally {
      setBusyTaskId(null)
    }
  }

  const visibleTasks =
    tasks.data?.filter((task) => filter === TASK_FILTER_ALL || task.status === filter) ?? []
  const filters: TaskFilter[] = [TASK_FILTER_ALL, ...TASK_STATUS_VALUES]

  return (
    <Card>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">{phase.name}</h2>
          <Button
            iconOnly
            size={BUTTON_SIZES.SM}
            variant={BUTTON_VARIANTS.GHOST}
            aria-label={COMMON_TEXTS.RENAME}
            title={COMMON_TEXTS.RENAME}
            icon={<Pencil className="size-4" />}
            onClick={onRename}
          />
          <Button
            iconOnly
            size={BUTTON_SIZES.SM}
            variant={BUTTON_VARIANTS.GHOST}
            aria-label={PHASE_TEXTS.DELETE_TITLE}
            title={PHASE_TEXTS.DELETE_TITLE}
            icon={<Trash2 className="size-4" />}
            onClick={onDelete}
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={TASK_TEXTS.STATUS_LABEL}>
          {filters.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
              className={cn(
                'cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                filter === option
                  ? 'text-accent shadow-neu-inset-sm'
                  : 'text-muted shadow-neu-sm hover:text-ink'
              )}
            >
              {option === TASK_FILTER_ALL ? TASK_TEXTS.FILTER_ALL : TASK_STATUS_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={createTask} className="mb-5 flex gap-3">
        <input
          aria-label={TASK_TEXTS.TITLE_LABEL}
          className={insetFieldClasses}
          placeholder={TASK_TEXTS.NEW_PLACEHOLDER}
          maxLength={FIELD_LIMITS.TASK_TITLE_MAX}
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
        />
        <Button
          type="submit"
          variant={BUTTON_VARIANTS.PRIMARY}
          loading={creating}
          disabled={!newTitle.trim()}
          icon={<Plus className="size-4" />}
        >
          {TASK_TEXTS.ADD}
        </Button>
      </form>

      {actionError && (
        <div className="mb-4">
          <ErrorBanner message={actionError} />
        </div>
      )}

      {tasks.status === ASYNC_STATUS.LOADING && <LoadingState />}
      {tasks.status === ASYNC_STATUS.ERROR && (
        <ErrorBanner message={tasks.error} onRetry={tasks.reload} />
      )}
      {tasks.status === ASYNC_STATUS.SUCCESS &&
        (visibleTasks.length === 0 ? (
          <EmptyState
            icon={<ListTodo className="size-7" />}
            title={TASK_TEXTS.EMPTY_TITLE}
            description={tasks.data.length === 0 ? TASK_TEXTS.EMPTY_BODY : TASK_TEXTS.EMPTY_FILTER}
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {visibleTasks.map((task) => (
              <li key={task.id}>
                <div
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(buildRoute.task(environmentId, phase.projectId, task.id))}
                  onKeyDown={(event) => {
                    if (event.key === KEYS.ENTER)
                      navigate(buildRoute.task(environmentId, phase.projectId, task.id))
                  }}
                  className="flex cursor-pointer items-center gap-4 rounded-neu-sm px-4 py-3 shadow-neu-sm transition-shadow hover:shadow-neu"
                >
                  <StatusBadge status={task.status} className="w-32 justify-center" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{task.title}</p>
                    <p className="text-xs text-muted">
                      {TASK_TEXTS.CREATED_AT} {formatDate(task.createdAt)}
                    </p>
                  </div>
                  <ElapsedTime
                    className="text-sm text-muted"
                    timeSpentSeconds={task.timeSpentSeconds}
                    timerStartedAt={task.timerStartedAt}
                  />
                  <TimerButton
                    iconOnly
                    size={BUTTON_SIZES.SM}
                    running={Boolean(task.timerStartedAt)}
                    loading={busyTaskId === task.id}
                    onToggle={() => void toggleTimer(task)}
                  />
                  <ChevronRight className="size-4 text-muted" aria-hidden />
                </div>
              </li>
            ))}
          </ul>
        ))}
    </Card>
  )
}
