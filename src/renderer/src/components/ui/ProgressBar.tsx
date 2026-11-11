const PERCENT = 100

/** Barra de progreso hundida con relleno de acento. */
export function ProgressBar({
  value,
  total,
  label
}: {
  value: number
  total: number
  label: string
}) {
  const percent = total > 0 ? Math.round((value / total) * PERCENT) : 0
  return (
    <div className="flex min-w-36 flex-col gap-1.5">
      <div
        className="h-2.5 overflow-hidden rounded-full shadow-neu-inset-sm"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={PERCENT}
        aria-valuenow={percent}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-success transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-muted">{label}</span>
    </div>
  )
}
