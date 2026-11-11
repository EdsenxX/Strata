import { RotateCcw, Sparkles } from 'lucide-react'
import {
  PLATFORMS,
  SETTINGS_TEXTS,
  UPDATE_BANNER_TEXTS,
  UPDATE_INSTALL_FAILED_TEXT,
  UPDATE_STATUS
} from '@shared/constants'
import { api } from '../../api/client'
import { useUpdateStore } from '../../stores/updateStore'
import { BUTTON_SIZES, BUTTON_VARIANTS, Button } from '../ui/Button'

/** Aviso flotante cuando ya se descargó una versión nueva. */
export function UpdateBanner() {
  const update = useUpdateStore((state) => state.update)
  const dismissed = useUpdateStore((state) => state.bannerDismissed)
  const { install, dismissBanner } = useUpdateStore.getState()

  const visible =
    update &&
    !update.startupInstall &&
    !dismissed &&
    (update.status === UPDATE_STATUS.DOWNLOADED || update.status === UPDATE_STATUS.INSTALLING)
  if (!visible) return null

  return (
    <div
      role="status"
      className="fixed right-6 bottom-6 z-40 flex w-80 flex-col gap-4 rounded-neu bg-base p-5 shadow-neu-lg"
    >
      <div className="flex gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-neu-sm text-accent shadow-neu-inset">
          <Sparkles className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold">
            {UPDATE_BANNER_TEXTS.TITLE(update.availableVersion ?? '')}
          </p>
          {/* Si la instalación falló se muestra solo el motivo, para no saturar el aviso. */}
          {update.installFailed ? (
            <p role="alert" className="text-xs font-semibold text-danger">
              {UPDATE_INSTALL_FAILED_TEXT}
            </p>
          ) : (
            <p className="text-xs text-muted">{UPDATE_BANNER_TEXTS.BODY}</p>
          )}
          {api.platform === PLATFORMS.LINUX && (
            <p className="text-xs text-muted">{UPDATE_BANNER_TEXTS.LINUX_PASSWORD_NOTE}</p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button size={BUTTON_SIZES.SM} variant={BUTTON_VARIANTS.GHOST} onClick={dismissBanner}>
          {SETTINGS_TEXTS.LATER}
        </Button>
        <Button
          size={BUTTON_SIZES.SM}
          variant={BUTTON_VARIANTS.PRIMARY}
          icon={<RotateCcw className="size-4" />}
          loading={update.status === UPDATE_STATUS.INSTALLING}
          onClick={() => void install()}
        >
          {SETTINGS_TEXTS.RESTART_AND_INSTALL}
        </Button>
      </div>
    </div>
  )
}
