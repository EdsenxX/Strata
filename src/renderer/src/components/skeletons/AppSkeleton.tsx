import { Card } from '../ui/Card'
import { Skeleton, SkeletonGroup } from '../ui/Skeleton'
import { EnvironmentsGridSkeleton } from './EnvironmentsGridSkeleton'
import { PageHeaderSkeleton } from './PageHeaderSkeleton'

const NAV_ITEM_COUNT = 3

/** Imita la app completa (barra lateral + contenido) mientras se recupera la sesión al arrancar. */
export function AppSkeleton() {
  return (
    <SkeletonGroup className="flex h-full">
      <div className="flex w-64 shrink-0 flex-col gap-8 p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: NAV_ITEM_COUNT }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
        <Card className="mt-auto flex items-center gap-3 p-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
        </Card>
      </div>
      <div className="min-w-0 flex-1 px-8 py-8">
        <div className="mx-auto w-full max-w-6xl">
          <PageHeaderSkeleton breadcrumbs={false} />
          <EnvironmentsGridSkeleton />
        </div>
      </div>
    </SkeletonGroup>
  )
}
