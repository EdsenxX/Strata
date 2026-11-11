import { Skeleton } from '../ui/Skeleton'

interface PageHeaderSkeletonProps {
  breadcrumbs?: boolean
  subtitle?: boolean
  action?: boolean
}

/** Imita PageHeader: migas, título, subtítulo y botón de acción. */
export function PageHeaderSkeleton({
  breadcrumbs = true,
  subtitle = true,
  action = true
}: PageHeaderSkeletonProps) {
  return (
    <div className="mb-8 flex flex-col gap-3">
      {breadcrumbs && <Skeleton className="h-3 w-56 rounded-full" />}
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-72" />
          {subtitle && <Skeleton className="h-4 w-96 rounded-full" />}
        </div>
        {action && <Skeleton className="h-11 w-40" />}
      </div>
    </div>
  )
}
