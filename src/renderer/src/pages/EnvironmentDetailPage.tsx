import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowDown, ArrowUp, FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  ASYNC_STATUS,
  COMMON_TEXTS,
  ENVIRONMENT_TEXTS,
  NAV_TEXTS,
  PROJECT_TEXTS,
  ROUTES,
  ROUTE_PARAMS,
  SORT_DIRECTIONS,
  buildRoute,
  type SortDirection
} from '@shared/constants'
import type { ProjectDto } from '@shared/types'
import { api, unwrap } from '../api/client'
import { ProjectFormModal, type ProjectFormValues } from '../components/forms/ProjectFormModal'
import { PageHeader } from '../components/layout/PageHeader'
import { BUTTON_SIZES, BUTTON_VARIANTS, Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { cn } from '../components/ui/cn'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { PageHeaderSkeleton } from '../components/skeletons/PageHeaderSkeleton'
import { ProjectsTableSkeleton } from '../components/skeletons/ProjectsTableSkeleton'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useAsyncData } from '../hooks/useAsyncData'
import { formatDate } from '../utils/format'

/** Celdas de la tabla: la fila completa se resalta al pasar el cursor. */
const CELL_CLASSES =
  'px-4 py-3 transition-colors group-hover:bg-accent/6 first:rounded-l-neu-sm last:rounded-r-neu-sm'

const sortByCreatedAt = (projects: ProjectDto[], direction: SortDirection): ProjectDto[] => {
  const factor = direction === SORT_DIRECTIONS.ASC ? 1 : -1
  return [...projects].sort((a, b) => factor * a.createdAt.localeCompare(b.createdAt))
}

export function EnvironmentDetailPage() {
  const params = useParams()
  const environmentId = params[ROUTE_PARAMS.ENVIRONMENT_ID] ?? ''
  const navigate = useNavigate()

  const loadData = useCallback(async () => {
    const [environment, projects] = await Promise.all([
      unwrap(api.environments.get(environmentId)),
      unwrap(api.projects.list(environmentId))
    ])
    return { environment, projects }
  }, [environmentId])
  const data = useAsyncData(loadData)
  const [sortDirection, setSortDirection] = useState<SortDirection>(SORT_DIRECTIONS.DESC)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<ProjectDto | null>(null)
  const [deleting, setDeleting] = useState<ProjectDto | null>(null)

  const sortedProjects = useMemo(
    () => (data.data ? sortByCreatedAt(data.data.projects, sortDirection) : []),
    [data.data, sortDirection]
  )

  const replaceProjects = (updater: (projects: ProjectDto[]) => ProjectDto[]) =>
    data.setData((current) => {
      const projects = updater(current.projects)
      return {
        environment: { ...current.environment, projectCount: projects.length },
        projects
      }
    })

  const createProject = async (values: ProjectFormValues) => {
    const created = await unwrap(api.projects.create({ environmentId, ...values }))
    replaceProjects((projects) => [created, ...projects])
  }

  const updateProject = async (values: ProjectFormValues) => {
    if (!editing) return
    const updated = await unwrap(api.projects.update({ id: editing.id, ...values }))
    replaceProjects((projects) => projects.map((item) => (item.id === updated.id ? updated : item)))
  }

  const deleteProject = async () => {
    if (!deleting) return
    await unwrap(api.projects.remove(deleting.id))
    replaceProjects((projects) => projects.filter((item) => item.id !== deleting.id))
  }

  if (data.status === ASYNC_STATUS.LOADING) {
    return (
      <>
        <PageHeaderSkeleton />
        <ProjectsTableSkeleton />
      </>
    )
  }
  if (data.status === ASYNC_STATUS.ERROR) {
    return <ErrorBanner message={data.error} onRetry={data.reload} />
  }

  const { environment } = data.data
  const SortIcon = sortDirection === SORT_DIRECTIONS.DESC ? ArrowDown : ArrowUp
  const newButton = (
    <Button
      variant={BUTTON_VARIANTS.PRIMARY}
      icon={<Plus className="size-4" />}
      onClick={() => setCreating(true)}
    >
      {PROJECT_TEXTS.NEW}
    </Button>
  )

  return (
    <>
      <PageHeader
        title={environment.name}
        subtitle={ENVIRONMENT_TEXTS.PROJECT_COUNT(environment.projectCount)}
        breadcrumbs={[
          { label: NAV_TEXTS.ENVIRONMENTS, to: ROUTES.ENVIRONMENTS },
          { label: environment.name }
        ]}
        actions={newButton}
      />

      <Card className="p-0">
        {sortedProjects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="size-7" />}
            title={PROJECT_TEXTS.EMPTY_TITLE}
            description={PROJECT_TEXTS.EMPTY_BODY}
            action={newButton}
          />
        ) : (
          <div className="overflow-x-auto p-4">
            <table className="w-full border-separate border-spacing-y-2 text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold text-muted">
                  <th className="px-4 py-2">{PROJECT_TEXTS.COLUMN_NAME}</th>
                  <th className="px-4 py-2">{PROJECT_TEXTS.COLUMN_DESCRIPTION}</th>
                  <th className="px-4 py-2">{PROJECT_TEXTS.COLUMN_PROGRESS}</th>
                  <th
                    className="px-4 py-2"
                    aria-sort={sortDirection === SORT_DIRECTIONS.ASC ? 'ascending' : 'descending'}
                  >
                    <button
                      type="button"
                      title={PROJECT_TEXTS.SORT_BY_CREATED_AT}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-accent hover:shadow-neu-sm"
                      onClick={() =>
                        setSortDirection((current) =>
                          current === SORT_DIRECTIONS.DESC
                            ? SORT_DIRECTIONS.ASC
                            : SORT_DIRECTIONS.DESC
                        )
                      }
                    >
                      {PROJECT_TEXTS.COLUMN_CREATED_AT}
                      <SortIcon className="size-3.5" />
                    </button>
                  </th>
                  <th className="px-4 py-2">{PROJECT_TEXTS.COLUMN_UPDATED_AT}</th>
                  <th className="px-4 py-2 text-right">{COMMON_TEXTS.ACTIONS}</th>
                </tr>
              </thead>
              <tbody>
                {sortedProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="group cursor-pointer"
                    onClick={() => navigate(buildRoute.project(environmentId, project.id))}
                  >
                    <td className={cn(CELL_CLASSES, 'max-w-56')}>
                      <Link
                        to={buildRoute.project(environmentId, project.id)}
                        className="block truncate font-semibold hover:text-accent"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className={cn(CELL_CLASSES, 'max-w-72')}>
                      <span className="line-clamp-2 text-muted">
                        {project.description || COMMON_TEXTS.NO_DESCRIPTION}
                      </span>
                    </td>
                    <td className={CELL_CLASSES}>
                      <ProgressBar
                        value={project.completedTaskCount}
                        total={project.taskCount}
                        label={PROJECT_TEXTS.PROGRESS(
                          project.completedTaskCount,
                          project.taskCount
                        )}
                      />
                    </td>
                    <td className={cn(CELL_CLASSES, 'whitespace-nowrap text-muted')}>
                      {formatDate(project.createdAt)}
                    </td>
                    <td className={cn(CELL_CLASSES, 'whitespace-nowrap text-muted')}>
                      {formatDate(project.updatedAt)}
                    </td>
                    <td className={CELL_CLASSES}>
                      <div
                        className="flex justify-end gap-2"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Button
                          iconOnly
                          size={BUTTON_SIZES.SM}
                          aria-label={COMMON_TEXTS.EDIT}
                          title={COMMON_TEXTS.EDIT}
                          icon={<Pencil className="size-4" />}
                          onClick={() => setEditing(project)}
                        />
                        <Button
                          iconOnly
                          size={BUTTON_SIZES.SM}
                          variant={BUTTON_VARIANTS.DANGER}
                          aria-label={COMMON_TEXTS.DELETE}
                          title={COMMON_TEXTS.DELETE}
                          icon={<Trash2 className="size-4" />}
                          onClick={() => setDeleting(project)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ProjectFormModal
        open={creating}
        title={PROJECT_TEXTS.CREATE_TITLE}
        submitLabel={COMMON_TEXTS.CREATE}
        onSubmit={createProject}
        onClose={() => setCreating(false)}
      />
      <ProjectFormModal
        open={editing !== null}
        title={PROJECT_TEXTS.EDIT_TITLE}
        initialValues={
          editing ? { name: editing.name, description: editing.description } : undefined
        }
        onSubmit={updateProject}
        onClose={() => setEditing(null)}
      />
      <ConfirmDialog
        open={deleting !== null}
        title={PROJECT_TEXTS.DELETE_TITLE}
        description={deleting ? PROJECT_TEXTS.DELETE_BODY(deleting.name) : ''}
        onConfirm={deleteProject}
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
