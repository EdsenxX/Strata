import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import { FolderOpen, FolderPlus, Pencil, Plus, Trash2 } from 'lucide-react'
import { ASYNC_STATUS, COMMON_TEXTS, ENVIRONMENT_TEXTS, buildRoute } from '@shared/constants'
import type { EnvironmentDto } from '@shared/types'
import { api, unwrap } from '../api/client'
import { NameFormModal } from '../components/forms/NameFormModal'
import { PageHeader } from '../components/layout/PageHeader'
import { BUTTON_SIZES, BUTTON_VARIANTS, Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { LoadingState } from '../components/ui/LoadingState'
import { useAsyncData } from '../hooks/useAsyncData'
import { formatDate } from '../utils/format'

export function EnvironmentsPage() {
  const loadEnvironments = useCallback(() => unwrap(api.environments.list()), [])
  const environments = useAsyncData(loadEnvironments)
  const [creating, setCreating] = useState(false)
  const [renaming, setRenaming] = useState<EnvironmentDto | null>(null)
  const [deleting, setDeleting] = useState<EnvironmentDto | null>(null)

  const createEnvironment = async (name: string) => {
    const created = await unwrap(api.environments.create({ name }))
    environments.setData((current) => [created, ...current])
  }

  const renameEnvironment = async (name: string) => {
    if (!renaming) return
    const updated = await unwrap(api.environments.update({ id: renaming.id, name }))
    environments.setData((current) =>
      current.map((item) => (item.id === updated.id ? updated : item))
    )
  }

  const deleteEnvironment = async () => {
    if (!deleting) return
    await unwrap(api.environments.remove(deleting.id))
    environments.setData((current) => current.filter((item) => item.id !== deleting.id))
  }

  const newButton = (
    <Button
      variant={BUTTON_VARIANTS.PRIMARY}
      icon={<Plus className="size-4" />}
      onClick={() => setCreating(true)}
    >
      {ENVIRONMENT_TEXTS.NEW}
    </Button>
  )

  return (
    <>
      <PageHeader
        title={ENVIRONMENT_TEXTS.PAGE_TITLE}
        subtitle={ENVIRONMENT_TEXTS.PAGE_SUBTITLE}
        actions={newButton}
      />

      {environments.status === ASYNC_STATUS.LOADING && <LoadingState />}
      {environments.status === ASYNC_STATUS.ERROR && (
        <ErrorBanner message={environments.error} onRetry={environments.reload} />
      )}
      {environments.status === ASYNC_STATUS.SUCCESS &&
        (environments.data.length === 0 ? (
          <Card>
            <EmptyState
              icon={<FolderPlus className="size-7" />}
              title={ENVIRONMENT_TEXTS.EMPTY_TITLE}
              description={ENVIRONMENT_TEXTS.EMPTY_BODY}
              action={newButton}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {environments.data.map((environment) => (
              <div
                key={environment.id}
                className="group relative rounded-neu bg-base shadow-neu transition-shadow hover:shadow-neu-lg"
              >
                <Link
                  to={buildRoute.environment(environment.id)}
                  className="flex flex-col gap-5 rounded-neu p-6"
                >
                  <div className="flex size-12 items-center justify-center rounded-neu-sm text-accent shadow-neu-inset">
                    <FolderOpen className="size-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h2
                      className="line-clamp-2 text-lg font-bold break-words"
                      title={environment.name}
                    >
                      {environment.name}
                    </h2>
                    <p className="text-sm text-muted">
                      {ENVIRONMENT_TEXTS.PROJECT_COUNT(environment.projectCount)}
                    </p>
                  </div>
                  <p className="text-xs text-muted">
                    {ENVIRONMENT_TEXTS.CREATED_AT} {formatDate(environment.createdAt)}
                  </p>
                </Link>
                <div className="absolute top-5 right-5 flex gap-2 opacity-60 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <Button
                    iconOnly
                    size={BUTTON_SIZES.SM}
                    aria-label={COMMON_TEXTS.RENAME}
                    title={COMMON_TEXTS.RENAME}
                    icon={<Pencil className="size-4" />}
                    onClick={() => setRenaming(environment)}
                  />
                  <Button
                    iconOnly
                    size={BUTTON_SIZES.SM}
                    variant={BUTTON_VARIANTS.DANGER}
                    aria-label={COMMON_TEXTS.DELETE}
                    title={COMMON_TEXTS.DELETE}
                    icon={<Trash2 className="size-4" />}
                    onClick={() => setDeleting(environment)}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}

      <NameFormModal
        open={creating}
        title={ENVIRONMENT_TEXTS.CREATE_TITLE}
        label={ENVIRONMENT_TEXTS.NAME_LABEL}
        placeholder={ENVIRONMENT_TEXTS.NAME_PLACEHOLDER}
        submitLabel={COMMON_TEXTS.CREATE}
        onSubmit={createEnvironment}
        onClose={() => setCreating(false)}
      />
      <NameFormModal
        open={renaming !== null}
        title={ENVIRONMENT_TEXTS.RENAME_TITLE}
        label={ENVIRONMENT_TEXTS.NAME_LABEL}
        initialValue={renaming?.name}
        onSubmit={renameEnvironment}
        onClose={() => setRenaming(null)}
      />
      <ConfirmDialog
        open={deleting !== null}
        title={ENVIRONMENT_TEXTS.DELETE_TITLE}
        description={deleting ? ENVIRONMENT_TEXTS.DELETE_BODY(deleting.name) : ''}
        onConfirm={deleteEnvironment}
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
