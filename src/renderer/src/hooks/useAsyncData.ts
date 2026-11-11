/**
 * Carga datos asíncronos con estados de carga/éxito/error y permite recargar
 * o modificar el resultado localmente tras una mutación.
 *
 * `loader` debe ser estable (envuélvelo en useCallback con sus dependencias).
 */
import { useCallback, useEffect, useState } from 'react'
import { ASYNC_STATUS } from '@shared/constants'
import { getErrorMessage } from '../api/client'

type AsyncState<T> =
  | { status: typeof ASYNC_STATUS.LOADING; data?: undefined; error?: undefined }
  | { status: typeof ASYNC_STATUS.SUCCESS; data: T; error?: undefined }
  | { status: typeof ASYNC_STATUS.ERROR; data?: undefined; error: string }

export function useAsyncData<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: ASYNC_STATUS.LOADING })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true
    loader().then(
      (data) => active && setState({ status: ASYNC_STATUS.SUCCESS, data }),
      (error: unknown) =>
        active && setState({ status: ASYNC_STATUS.ERROR, error: getErrorMessage(error) })
    )
    return () => {
      active = false
    }
  }, [loader, reloadToken])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  const setData = useCallback((updater: (current: T) => T) => {
    setState((current) =>
      current.status === ASYNC_STATUS.SUCCESS
        ? { ...current, data: updater(current.data) }
        : current
    )
  }, [])

  return { ...state, reload, setData }
}
