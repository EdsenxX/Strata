import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Clock, PencilLine, Trash2 } from 'lucide-react'
import {
  ASYNC_STATUS,
  COMMON_TEXTS,
  FIELD_LIMITS,
  KEYS,
  NAV_TEXTS,
  ROUTES,
  ROUTE_PARAMS,
  SAVE_STATUS,
  TASK_TEXTS,
  buildRoute,
  type SaveStatus
} from '@shared/constants'
import type { TaskDto } from '@shared/types'
import { api, getErrorMessage, unwrap } from '../api/client'
import { MarkdownEditor } from '../components/editor/MarkdownEditor'
import { ElapsedTime } from '../components/tasks/ElapsedTime'
import { ManualTimeModal } from '../components/tasks/ManualTimeModal'
import { StatusSelector } from '../components/tasks/StatusSelector'
import { TimerButton } from '../components/tasks/TimerButton'
import { Breadcrumbs } from '../components/layout/Breadcrumbs'
import { BUTTON_VARIANTS, Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { LoadingState } from '../components/ui/LoadingState'
import { cn } from '../components/ui/cn'
import { useAsyncData } from '../hooks/useAsyncData'
import { useDebouncedSave } from '../hooks/useDebouncedSave'
import { formatDateTime } from '../utils/format'

const SAVE_STATUS_TEXT: Record<SaveStatus, string> = {
  [SAVE_STATUS.IDLE]: '',
  [SAVE_STATUS.SAVING]: TASK_TEXTS.SAVING,
  [SAVE_STATUS.SAVED]: TASK_TEXTS.SAVED,
  [SAVE_STATUS.ERROR]: TASK_TEXTS.SAVE_ERROR
}

export function TaskDetailPage() {
  const params = useParams()
  const environmentId = params[ROUTE_PARAMS.ENVIRONMENT_ID] ?? ''
  const projectId = params[ROUTE_PARAMS.PROJECT_ID] ?? ''
  const taskId = params[ROUTE_PARAMS.TASK_ID] ?? ''
  const navigate = useNavigate()

  const loadData = useCallback(async () => {
    const [environment, project, phases, task] = await Promise.all([
      unwrap(api.environments.get(environmentId)),
      unwrap(api.projects.get(projectId)),
      unwrap(api.phases.list(projectId)),
      unwrap(api.tasks.get(taskId))
    ])
    return { environment, project, phase: phases.find((item) => item.id === task.phaseId), task }
  }, [environmentId, projectId, taskId])
  const data = useAsyncData(loadData)
  const { setData } = data

  const [title, setTitle] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editingTime, setEditingTime] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const applyTask = useCallback(
    (task: TaskDto) => setData((current) => ({ ...current, task })),
    [setData]
  )

  // El contenido se guarda con espera; solo se actualizan los metadatos para no tocar el editor.
  const saveContent = useCallback(
    async (content: string) => {
      const saved = await unwrap(api.tasks.update({ id: taskId, content }))
      setData((current) => ({ ...current, task: { ...current.task, updatedAt: saved.updatedAt } }))
    },
    [setData, taskId]
  )
  const contentSave = useDebouncedSave(saveContent)

  const runAction = async (action: () => Promise<TaskDto>) => {
    setBusy(true)
    setActionError(null)
    try {
      applyTask(await action())
    } catch (caught) {
      setActionError(getErrorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  if (data.status === ASYNC_STATUS.LOADING) return <LoadingState />
  if (data.status === ASYNC_STATUS.ERROR)
    return <ErrorBanner message={data.error} onRetry={data.reload} />

  const { environment, project, phase, task } = data.data
  const running = Boolean(task.timerStartedAt)
  const currentTitle = title ?? task.title

  const saveTitle = async () => {
    const trimmed = currentTitle.trim()
    if (!trimmed || trimmed === task.title) {
      setTitle(null)
      return
    }
    await runAction(() => unwrap(api.tasks.update({ id: task.id, title: trimmed })))
    setTitle(null)
  }

  const changeStatus = (statusId: string) =>
    runAction(() => unwrap(api.tasks.update({ id: task.id, statusId })))

  const toggleTimer = () =>
    runAction(() => unwrap(running ? api.tasks.pauseTimer(task.id) : api.tasks.startTimer(task.id)))

  const setTime = async (seconds: number) => {
    applyTask(await unwrap(api.tasks.setTime({ id: task.id, timeSpentSeconds: seconds })))
  }

  const deleteTask = async () => {
    await unwrap(api.tasks.remove(task.id))
    navigate(buildRoute.project(environmentId, projectId, task.phaseId), { replace: true })
  }

  return (
    <>
      <header className="mb-8 flex flex-col gap-3">
        <Breadcrumbs
          items={[
            { label: NAV_TEXTS.ENVIRONMENTS, to: ROUTES.ENVIRONMENTS },
            { label: environment.name, to: buildRoute.environment(environmentId) },
            { label: project.name, to: buildRoute.project(environmentId, projectId) },
            ...(phase
              ? [{ label: phase.name, to: buildRoute.project(environmentId, projectId, phase.id) }]
              : []),
            { label: task.title }
          ]}
        />
        <input
          aria-label={TASK_TEXTS.TITLE_LABEL}
          value={currentTitle}
          maxLength={FIELD_LIMITS.TASK_TITLE_MAX}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => void saveTitle()}
          onKeyDown={(event) => {
            if (event.key === KEYS.ENTER) event.currentTarget.blur()
            if (event.key === KEYS.ESCAPE) setTitle(null)
          }}
          className="w-full rounded-neu-sm bg-transparent px-3 py-2 -ml-3 text-3xl font-extrabold tracking-tight outline-none transition-shadow hover:shadow-neu-inset-sm focus:shadow-neu-inset"
        />
      </header>

      {actionError && (
        <div className="mb-6">
          <ErrorBanner message={actionError} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-wider text-muted uppercase">
              {TASK_TEXTS.CONTENT_LABEL}
            </h2>
            <span
              aria-live="polite"
              className={cn(
                'text-xs',
                contentSave.status === SAVE_STATUS.ERROR ? 'text-danger' : 'text-muted'
              )}
            >
              {SAVE_STATUS_TEXT[contentSave.status]}
            </span>
          </div>
          <MarkdownEditor
            key={task.id}
            initialValue={task.content}
            onChange={contentSave.schedule}
          />
        </Card>

        <aside className="flex flex-col gap-6">
          <Card>
            <h2 className="mb-4 text-xs font-bold tracking-wider text-muted uppercase">
              {TASK_TEXTS.STATUS_LABEL}
            </h2>
            <StatusSelector
              value={task.statusId}
              disabled={busy}
              onChange={(statusId) => void changeStatus(statusId)}
            />
          </Card>

          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-wider text-muted uppercase">
              <Clock className="size-3.5" />
              {TASK_TEXTS.TIME_LABEL}
            </h2>
            <div className="mb-5 flex flex-col items-center gap-1 rounded-neu-sm py-5 shadow-neu-inset">
              <ElapsedTime
                className="text-3xl font-semibold text-ink"
                timeSpentSeconds={task.timeSpentSeconds}
                timerStartedAt={task.timerStartedAt}
              />
              {running && (
                <span className="text-xs text-info">{TASK_TEXTS.TIMER_RUNNING_HINT}</span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3">
              <TimerButton running={running} loading={busy} onToggle={() => void toggleTimer()} />
              <Button
                icon={<PencilLine className="size-4" />}
                disabled={running || busy}
                title={running ? TASK_TEXTS.TIMER_RUNNING_HINT : TASK_TEXTS.EDIT_TIME}
                onClick={() => setEditingTime(true)}
              >
                {TASK_TEXTS.EDIT_TIME}
              </Button>
            </div>
          </Card>

          <Card className="space-y-2 text-xs text-muted">
            <p>
              {TASK_TEXTS.CREATED_AT}: {formatDateTime(task.createdAt)}
            </p>
            <p>
              {TASK_TEXTS.UPDATED_AT}: {formatDateTime(task.updatedAt)}
            </p>
            <Button
              className="mt-3 w-full"
              variant={BUTTON_VARIANTS.DANGER}
              icon={<Trash2 className="size-4" />}
              onClick={() => setDeleting(true)}
            >
              {TASK_TEXTS.DELETE_TITLE}
            </Button>
          </Card>
        </aside>
      </div>

      <ManualTimeModal
        open={editingTime}
        initialSeconds={task.timeSpentSeconds}
        onSubmit={setTime}
        onClose={() => setEditingTime(false)}
      />
      <ConfirmDialog
        open={deleting}
        title={TASK_TEXTS.DELETE_TITLE}
        description={TASK_TEXTS.DELETE_BODY(task.title)}
        confirmLabel={COMMON_TEXTS.DELETE}
        onConfirm={deleteTask}
        onClose={() => setDeleting(false)}
      />
    </>
  )
}
