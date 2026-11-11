import { Skeleton, SkeletonGroup } from '../ui/Skeleton'

const CARD_COUNT = 6

/** Imita la cuadrícula de tarjetas de entornos. */
export function EnvironmentsGridSkeleton() {
  return (
    <SkeletonGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: CARD_COUNT }, (_, index) => (
        <div key={index} className="flex flex-col gap-5 rounded-neu p-6 shadow-neu">
          <Skeleton className="size-12" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3 rounded-full" />
          </div>
          <Skeleton className="h-3 w-1/4 rounded-full" />
        </div>
      ))}
    </SkeletonGroup>
  )
}
