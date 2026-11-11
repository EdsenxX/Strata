import { RotateCcw, Sparkles } from 'lucide-react'
import { PLATFORMS, SETTINGS_TEXTS, UPDATE_BANNER_TEXTS, UPDATE_STATUS } from '@shared/constants'
import { api } from '../../api/client'
import { useUpdateStore } from '../../stores/updateStore'
import { BUTTON_SIZES, BUTTON_VARIANTS, Button } from '../ui/Button'

/** Aviso flotante cuando ya se descargó una versión nueva. */
export function UpdateBanner() {
  const update = useUpdateStore((state) => state.update)
  const dismissed = useUpdateStore((state) => state.bannerDismissed)
  const { install, dismissBanner } = useUpdateStore.getState()

  if (!update || update.status !== UPDATE_STATUS.DOWNLOADED || dismissed) return null

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
          <p className="text-xs text-muted">{UPDATE_BANNER_TEXTS.BODY}</p>
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
          onClick={() => void install()}
        >
          {SETTINGS_TEXTS.RESTART_AND_INSTALL}
        </Button>
      </div>
    </div>
  )
}
