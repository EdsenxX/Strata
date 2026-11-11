import { Skeleton, SkeletonGroup } from '../ui/Skeleton'

/** Imita la sección de actualizaciones de Configuración. */
export function UpdatesSectionSkeleton() {
  return (
    <SkeletonGroup className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-3 w-96 rounded-full" />
        </div>
        <Skeleton className="h-8 w-14 rounded-full" />
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-11 w-56" />
    </SkeletonGroup>
  )
}
