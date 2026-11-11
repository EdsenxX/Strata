import { Card } from '../ui/Card'
import { Skeleton, SkeletonGroup } from '../ui/Skeleton'
import { EditorSkeleton } from './EditorSkeleton'

const STATUS_OPTION_COUNT = 4

/** Imita el detalle de tarea: título, editor y columna de estado/tiempo/metadatos. */
export function TaskDetailSkeleton() {
  return (
    <SkeletonGroup>
      <div className="mb-8 flex flex-col gap-3">
        <Skeleton className="h-3 w-80 rounded-full" />
        <Skeleton className="h-10 w-96" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-h-96">
          <Skeleton className="mb-6 h-3 w-24 rounded-full" />
          <EditorSkeleton />
        </Card>
        <div className="flex flex-col gap-6">
          <Card>
            <Skeleton className="mb-4 h-3 w-16 rounded-full" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: STATUS_OPTION_COUNT }, (_, index) => (
                <Skeleton key={index} className="h-9" />
              ))}
            </div>
          </Card>
          <Card>
            <Skeleton className="mb-4 h-3 w-32 rounded-full" />
            <Skeleton className="mb-5 h-20 w-full" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          </Card>
          <Card className="flex flex-col gap-2">
            <Skeleton className="h-3 w-40 rounded-full" />
            <Skeleton className="h-3 w-40 rounded-full" />
            <Skeleton className="mt-3 h-11 w-full" />
          </Card>
        </div>
      </div>
    </SkeletonGroup>
  )
}
