/**
 * Tiempo total que se actualiza cada segundo mientras haya cronómetros en marcha.
 * Sirve para una tarea (un cronómetro) o para una fase/proyecto (varios).
 */
import { useEffect, useState } from 'react'
import { UI_TIMINGS } from '@shared/constants'
import { computeTotalSeconds } from '@shared/utils/duration'

export function useLiveSeconds(
  timeSpentSeconds: number,
  runningTimerStartedAts: readonly string[]
): number {
  const [now, setNow] = useState(() => Date.now())
  const running = runningTimerStartedAts.length > 0

  useEffect(() => {
    if (!running) return
    const intervalId = window.setInterval(() => setNow(Date.now()), UI_TIMINGS.TIMER_TICK_MS)
    return () => window.clearInterval(intervalId)
  }, [running])

  return computeTotalSeconds(timeSpentSeconds, runningTimerStartedAts, now)
}
