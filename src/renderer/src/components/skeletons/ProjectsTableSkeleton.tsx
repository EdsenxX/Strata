import { Card } from '../ui/Card'
import { Skeleton, SkeletonGroup } from '../ui/Skeleton'

const ROW_COUNT = 4
const COLUMN_WIDTHS = ['w-32', 'w-56', 'w-36', 'w-20', 'w-20']

/** Imita la tabla de proyectos de un entorno. */
export function ProjectsTableSkeleton() {
  return (
    <Card className="p-4">
      <SkeletonGroup className="flex flex-col gap-2">
        <div className="flex items-center gap-8 px-4 py-2">
          {COLUMN_WIDTHS.map((width, index) => (
            <Skeleton key={index} className={`h-3 rounded-full ${width}`} />
          ))}
        </div>
        {Array.from({ length: ROW_COUNT }, (_, index) => (
          <div key={index} className="flex items-center gap-8 px-4 py-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-56 rounded-full" />
            <div className="flex w-36 flex-col gap-1.5">
              <Skeleton className="h-2.5 w-full rounded-full" />
              <Skeleton className="h-3 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
            <div className="ml-auto flex gap-2">
              <Skeleton className="size-9" />
              <Skeleton className="size-9" />
            </div>
          </div>
        ))}
      </SkeletonGroup>
    </Card>
  )
}
