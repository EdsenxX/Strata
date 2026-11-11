/**
 * Suma de tiempo de un conjunto de tareas (por fase o por proyecto).
 *
 * El total "en vivo" = `timeSpentSeconds` (tramos cerrados) + el tramo en curso de cada cronómetro
 * activo. Por eso, además de la suma, se devuelven los inicios de los cronómetros en marcha y la
 * interfaz calcula el resto con `computeTotalSeconds()`.
 */
import type { TimeTotals } from '@shared/types'

export const EMPTY_TIME_TOTALS: TimeTotals = { timeSpentSeconds: 0, runningTimerStartedAts: [] }

/** Acumuladores para un `$group` de tareas. */
export const TIME_TOTALS_ACCUMULATORS = {
  timeSpentSeconds: { $sum: '$timeSpentSeconds' },
  // $$REMOVE descarta las tareas sin cronómetro activo.
  runningTimerStartedAts: {
    $push: { $cond: [{ $ne: ['$timerStartedAt', null] }, '$timerStartedAt', '$$REMOVE'] }
  }
}

export interface TimeTotalsRow {
  timeSpentSeconds?: number
  runningTimerStartedAts?: Array<Date | null>
}

export function toTimeTotals(row: TimeTotalsRow | undefined): TimeTotals {
  if (!row) return EMPTY_TIME_TOTALS
  return {
    timeSpentSeconds: row.timeSpentSeconds ?? 0,
    runningTimerStartedAts: (row.runningTimerStartedAts ?? [])
      .filter((date): date is Date => date instanceof Date)
      .map((date) => date.toISOString())
  }
}
