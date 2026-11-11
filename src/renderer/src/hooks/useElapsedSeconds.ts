/**
 * Tiempo total de una tarea que se actualiza cada segundo mientras el cronómetro corre.
 */
import { useEffect, useState } from 'react'
import { UI_TIMINGS } from '@shared/constants'
import { computeElapsedSeconds } from '@shared/utils/duration'

export function useElapsedSeconds(timeSpentSeconds: number, timerStartedAt: string | null): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!timerStartedAt) return
    const intervalId = window.setInterval(() => setNow(Date.now()), UI_TIMINGS.TIMER_TICK_MS)
    return () => window.clearInterval(intervalId)
  }, [timerStartedAt])

  return computeElapsedSeconds(timeSpentSeconds, timerStartedAt, now)
}
