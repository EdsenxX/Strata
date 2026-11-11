import { Download, Layers } from 'lucide-react'
import {
  PLATFORMS,
  STARTUP_UPDATE_TEXTS,
  UPDATE_BANNER_TEXTS,
  UPDATE_PROGRESS_MAX,
  UPDATE_STATUS,
  type UpdateStatus
} from '@shared/constants'
import { api } from '../../api/client'
import { useUpdateStore } from '../../stores/updateStore'
import { BUTTON_VARIANTS, Button } from '../ui/Button'
import { ProgressBar } from '../ui/ProgressBar'
import { Spinner } from '../ui/Spinner'

/** Estados en los que se muestra la pantalla de "actualizar al iniciar". */
const VISIBLE_STATUSES: readonly UpdateStatus[] = [
  UPDATE_STATUS.IDLE,
  UPDATE_STATUS.CHECKING,
  UPDATE_STATUS.AVAILABLE,
  UPDATE_STATUS.DOWNLOADING,
  UPDATE_STATUS.DOWNLOADED,
  UPDATE_STATUS.INSTALLING
]

/**
 * Pantalla completa mientras se actualiza al abrir la app ("Actualizar al iniciar").
 * Permite omitirlo; en ese caso la descarga sigue en segundo plano.
 */
export function StartupUpdateScreen() {
  const update = useUpdateStore((state) => state.update)
  const { skipStartup } = useUpdateStore.getState()

  if (!update?.startupInstall || !VISIBLE_STATUSES.includes(update.status)) return null

  const version = update.availableVersion ?? ''
  const installing =
    update.status === UPDATE_STATUS.INSTALLING || update.status === UPDATE_STATUS.DOWNLOADED
  const downloading = update.status === UPDATE_STATUS.DOWNLOADING
  const message = installing
    ? STARTUP_UPDATE_TEXTS.INSTALLING(version)
    : downloading
      ? STARTUP_UPDATE_TEXTS.DOWNLOADING(version)
      : STARTUP_UPDATE_TEXTS.CHECKING

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-base p-6"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-neu p-8 text-center shadow-neu-lg">
        <div className="flex size-16 items-center justify-center rounded-neu-sm text-accent shadow-neu-inset">
          {downloading ? <Download className="size-7" /> : <Layers className="size-7" />}
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-extrabold">{STARTUP_UPDATE_TEXTS.TITLE}</h1>
          <p className="text-sm text-muted">{message}</p>
          {installing && api.platform === PLATFORMS.LINUX && (
            <p className="text-xs text-muted">{UPDATE_BANNER_TEXTS.LINUX_PASSWORD_NOTE}</p>
          )}
        </div>
        {downloading ? (
          <div className="w-full">
            <ProgressBar
              value={update.progress}
              total={UPDATE_PROGRESS_MAX}
              label={`${update.progress}%`}
            />
          </div>
        ) : (
          <Spinner className="size-6 text-accent" />
        )}
        {!installing && (
          <Button variant={BUTTON_VARIANTS.GHOST} onClick={() => void skipStartup()}>
            {STARTUP_UPDATE_TEXTS.SKIP}
          </Button>
        )}
      </div>
    </div>
  )
}
