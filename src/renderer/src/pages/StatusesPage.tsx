import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  COMMON_TEXTS,
  STATUS_CATEGORY_HINTS,
  STATUS_CATEGORY_LABELS,
  STATUS_TEXTS
} from '@shared/constants'
import type { CreateStatusInput, TaskStatusDto } from '@shared/types'
import { getErrorMessage } from '../api/client'
import { StatusFormModal } from '../components/forms/StatusFormModal'
import { PageHeader } from '../components/layout/PageHeader'
import { BUTTON_SIZES, BUTTON_VARIANTS, Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { StatusRowsSkeleton } from '../components/skeletons/StatusRowsSkeleton'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useStatusStore } from '../stores/statusStore'

const MOVE_UP = -1
const MOVE_DOWN = 1

/** Primer estado (distinto de `status`) de la misma categoría: recibe sus tareas al eliminarlo. */
const findReplacement = (statuses: TaskStatusDto[], status: TaskStatusDto) =>
  statuses.find((item) => item.category === status.category && item.id !== status.id)

/** Administración de los estados de tarea del usuario. */
export function StatusesPage() {
  const loadedStatuses = useStatusStore((state) => state.statuses)
  const statuses = loadedStatuses ?? []
  const loadError = useStatusStore((state) => state.error)
  const { load, create, update, remove, reorder } = useStatusStore.getState()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<TaskStatusDto | null>(null)
  const [deleting, setDeleting] = useState<TaskStatusDto | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Refresca los conteos de tareas al entrar a la pantalla.
  useEffect(() => {
    void load()
  }, [load])

  const move = async (index: number, direction: number) => {
    const ids = statuses.map((status) => status.id)
    const target = index + direction
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    setActionError(null)
    try {
      await reorder(ids)
    } catch (caught) {
      setActionError(getErrorMessage(caught))
    }
  }

  const deletingReplacement = deleting ? findReplacement(statuses, deleting) : undefined

  return (
    <>
      <PageHeader
        title={STATUS_TEXTS.PAGE_TITLE}
        subtitle={STATUS_TEXTS.PAGE_SUBTITLE}
        actions={
          <Button
            variant={BUTTON_VARIANTS.PRIMARY}
            icon={<Plus className="size-4" />}
            onClick={() => setCreating(true)}
          >
            {STATUS_TEXTS.NEW}
          </Button>
        }
      />

      {actionError && (
        <div className="mb-6">
          <ErrorBanner message={actionError} />
        </div>
      )}

      {!loadedStatuses && loadError && (
        <ErrorBanner message={loadError} onRetry={() => void load()} />
      )}
      {!loadedStatuses && !loadError && <StatusRowsSkeleton />}

      {loadedStatuses && (
        <Card className="p-4">
          <ul className="flex flex-col gap-3">
            {statuses.map((status, index) => {
              const isLast = !findReplacement(statuses, status)
              return (
                <li
                  key={status.id}
                  className="flex items-center gap-4 rounded-neu-sm px-4 py-3 shadow-neu-sm"
                >
                  <StatusBadge statusId={status.id} className="w-40" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {STATUS_CATEGORY_LABELS[status.category]}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {STATUS_CATEGORY_HINTS[status.category]}
                    </p>
                  </div>
                  <span className="w-20 text-right text-xs text-muted">
                    {STATUS_TEXTS.TASK_COUNT(status.taskCount)}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      iconOnly
                      size={BUTTON_SIZES.SM}
                      variant={BUTTON_VARIANTS.GHOST}
                      aria-label={STATUS_TEXTS.MOVE_UP}
                      title={STATUS_TEXTS.MOVE_UP}
                      disabled={index === 0}
                      icon={<ArrowUp className="size-4" />}
                      onClick={() => void move(index, MOVE_UP)}
                    />
                    <Button
                      iconOnly
                      size={BUTTON_SIZES.SM}
                      variant={BUTTON_VARIANTS.GHOST}
                      aria-label={STATUS_TEXTS.MOVE_DOWN}
                      title={STATUS_TEXTS.MOVE_DOWN}
                      disabled={index === statuses.length - 1}
                      icon={<ArrowDown className="size-4" />}
                      onClick={() => void move(index, MOVE_DOWN)}
                    />
                    <Button
                      iconOnly
                      size={BUTTON_SIZES.SM}
                      aria-label={COMMON_TEXTS.EDIT}
                      title={COMMON_TEXTS.EDIT}
                      icon={<Pencil className="size-4" />}
                      onClick={() => setEditing(status)}
                    />
                    <Button
                      iconOnly
                      size={BUTTON_SIZES.SM}
                      variant={BUTTON_VARIANTS.DANGER}
                      aria-label={COMMON_TEXTS.DELETE}
                      title={isLast ? STATUS_TEXTS.LAST_IN_CATEGORY_HINT : COMMON_TEXTS.DELETE}
                      disabled={isLast}
                      icon={<Trash2 className="size-4" />}
                      onClick={() => setDeleting(status)}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      <StatusFormModal
        open={creating}
        title={STATUS_TEXTS.CREATE_TITLE}
        submitLabel={COMMON_TEXTS.CREATE}
        onSubmit={(values: CreateStatusInput) => create(values)}
        onClose={() => setCreating(false)}
      />
      <StatusFormModal
        open={editing !== null}
        title={STATUS_TEXTS.EDIT_TITLE}
        initialValues={
          editing
            ? { name: editing.name, color: editing.color, category: editing.category }
            : undefined
        }
        lockedCategory={
          editing && !findReplacement(statuses, editing) ? editing.category : undefined
        }
        onSubmit={(values) => (editing ? update({ id: editing.id, ...values }) : Promise.resolve())}
        onClose={() => setEditing(null)}
      />
      <ConfirmDialog
        open={deleting !== null}
        title={STATUS_TEXTS.DELETE_TITLE}
        description={
          deleting
            ? STATUS_TEXTS.DELETE_BODY(
                deleting.name,
                deleting.taskCount,
                deletingReplacement?.name ?? ''
              )
            : ''
        }
        onConfirm={() => (deleting ? remove(deleting.id) : Promise.resolve())}
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
