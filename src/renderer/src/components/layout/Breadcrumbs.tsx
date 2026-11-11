import { Fragment } from 'react'
import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { NAV_TEXTS } from '@shared/constants'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label={NAV_TEXTS.BREADCRUMB_LABEL}
      className="flex flex-wrap items-center gap-1 text-xs text-muted"
    >
      {items.map((item, index) => (
        <Fragment key={`${item.label}-${index}`}>
          {index > 0 && <ChevronRight className="size-3.5" aria-hidden />}
          {item.to ? (
            <Link to={item.to} className="rounded-md px-1.5 py-0.5 hover:text-accent">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="px-1.5 py-0.5 font-semibold text-ink">
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
