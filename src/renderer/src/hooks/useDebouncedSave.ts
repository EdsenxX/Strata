/**
 * Guardado automático con espera (debounce). Si el componente se desmonta con
 * cambios pendientes, los guarda de inmediato para no perder contenido.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { SAVE_STATUS, UI_TIMINGS, type SaveStatus } from '@shared/constants'

export function useDebouncedSave<T>(save: (value: T) => Promise<void>) {
  const [status, setStatus] = useState<SaveStatus>(SAVE_STATUS.IDLE)
  const saveRef = useRef(save)
  const pendingRef = useRef<{ value: T } | null>(null)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    saveRef.current = save
  }, [save])

  const flush = useCallback(async () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
    const pending = pendingRef.current
    if (!pending) return
    pendingRef.current = null
    setStatus(SAVE_STATUS.SAVING)
    try {
      await saveRef.current(pending.value)
      // Si llegó un cambio nuevo mientras guardábamos, seguimos en "guardando".
      if (!pendingRef.current) setStatus(SAVE_STATUS.SAVED)
    } catch {
      setStatus(SAVE_STATUS.ERROR)
    }
  }, [])

  const schedule = useCallback(
    (value: T) => {
      pendingRef.current = { value }
      setStatus(SAVE_STATUS.SAVING)
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => void flush(), UI_TIMINGS.AUTOSAVE_DEBOUNCE_MS)
    },
    [flush]
  )

  useEffect(() => () => void flush(), [flush])

  return { status, schedule, flush }
}
