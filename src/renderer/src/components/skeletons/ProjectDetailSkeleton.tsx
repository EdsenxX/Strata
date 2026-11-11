import { Card } from '../ui/Card'
import { Skeleton, SkeletonGroup } from '../ui/Skeleton'
import { PageHeaderSkeleton } from './PageHeaderSkeleton'
import { TaskRowsSkeleton } from './TaskRowsSkeleton'

const PHASE_CHIP_WIDTHS = ['w-36', 'w-32', 'w-28']
const FILTER_CHIP_COUNT = 5

/** Imita la vista de proyecto: encabezado, fases y lista de tareas. */
export function ProjectDetailSkeleton() {
  return (
    <SkeletonGroup>
      <PageHeaderSkeleton />
      <div className="mb-8 flex flex-col gap-4">
        <Skeleton className="h-3 w-16 rounded-full" />
        <div className="flex gap-3">
          {PHASE_CHIP_WIDTHS.map((width) => (
            <Skeleton key={width} className={`h-10 ${width}`} />
          ))}
        </div>
      </div>
      <Card>
        <div className="mb-5 flex items-center justify-between gap-4">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            {Array.from({ length: FILTER_CHIP_COUNT }, (_, index) => (
              <Skeleton key={index} className="h-7 w-20 rounded-full" />
            ))}
          </div>
        </div>
        <div className="mb-5 flex gap-3">
          <Skeleton className="h-11 flex-1" />
          <Skeleton className="h-11 w-32" />
        </div>
        <TaskRowsSkeleton />
      </Card>
    </SkeletonGroup>
  )
}
