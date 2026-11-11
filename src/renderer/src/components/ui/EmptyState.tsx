import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
      <div className="flex size-16 items-center justify-center rounded-full text-accent shadow-neu-inset">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold">{title}</h3>
        <p className="max-w-sm text-sm text-muted">{description}</p>
      </div>
      {action}
    </div>
  )
}
