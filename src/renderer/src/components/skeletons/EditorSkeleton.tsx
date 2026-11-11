import { Skeleton } from '../ui/Skeleton'

const LINE_WIDTHS = ['w-1/3', 'w-11/12', 'w-4/5', 'w-2/3', 'w-5/6']

/** Imita líneas de texto del editor Markdown mientras se inicializa. */
export function EditorSkeleton() {
  return (
    <div className="flex flex-col gap-3 pt-2 pl-[72px]" aria-hidden>
      {LINE_WIDTHS.map((width, index) => (
        <Skeleton key={index} className={`rounded-full ${index === 0 ? 'h-6' : 'h-4'} ${width}`} />
      ))}
    </div>
  )
}
