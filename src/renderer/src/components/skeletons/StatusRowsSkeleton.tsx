import { Card } from '../ui/Card'
import { Skeleton, SkeletonGroup } from '../ui/Skeleton'

const ROW_COUNT = 4
const ACTION_COUNT = 4

/** Imita la lista de estados de tarea. */
export function StatusRowsSkeleton() {
  return (
    <Card className="p-4">
      <SkeletonGroup className="flex flex-col gap-3">
        {Array.from({ length: ROW_COUNT }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-neu-sm px-4 py-3 shadow-neu-sm"
          >
            <Skeleton className="h-7 w-40 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-72 rounded-full" />
            </div>
            <Skeleton className="h-3 w-16 rounded-full" />
            <div className="flex gap-2">
              {Array.from({ length: ACTION_COUNT }, (_, action) => (
                <Skeleton key={action} className="size-9" />
              ))}
            </div>
          </div>
        ))}
      </SkeletonGroup>
    </Card>
  )
}
