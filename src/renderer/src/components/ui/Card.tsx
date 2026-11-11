import type { HTMLAttributes } from 'react'
import { cn } from './cn'

/** Superficie elevada base del sistema neumórfico. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-neu bg-base p-6 shadow-neu', className)} {...props} />
}
