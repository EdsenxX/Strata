import { Skeleton, SkeletonGroup } from '../ui/Skeleton'

const DEFAULT_ROW_COUNT = 3

/** Imita las filas de la lista de tareas de una fase. */
export function TaskRowsSkeleton({ rows = DEFAULT_ROW_COUNT }: { rows?: number }) {
  return (
    <SkeletonGroup className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 rounded-neu-sm px-4 py-3 shadow-neu-sm">
          <Skeleton className="h-6 w-32 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-28 rounded-full" />
          </div>
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="size-9" />
        </div>
      ))}
    </SkeletonGroup>
  )
}
