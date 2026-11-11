import { useState } from 'react'
import { Download, RefreshCw, RotateCcw } from 'lucide-react'
import {
  COMMON_TEXTS,
  SETTINGS_TEXTS,
  UPDATE_PROGRESS_MAX,
  UPDATE_STATUS,
  UPDATE_STATUS_TEXTS,
  type UpdateStatus
} from '@shared/constants'
import { getErrorMessage } from '../api/client'
import { PageHeader } from '../components/layout/PageHeader'
import { BUTTON_VARIANTS, Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { UpdatesSectionSkeleton } from '../components/skeletons/UpdatesSectionSkeleton'
import { ProgressBar } from '../components/ui/ProgressBar'
import { THEME_SWITCHER_VARIANTS, ThemeSwitcher } from '../components/ui/ThemeSwitcher'
import { Toggle } from '../components/ui/Toggle'
import { cn } from '../components/ui/cn'
import { useUpdateStore } from '../stores/updateStore'
import { formatDateTime } from '../utils/format'

/** Estados en los que no se puede iniciar otra búsqueda. */
const CHECK_DISABLED: readonly UpdateStatus[] = [
  UPDATE_STATUS.UNSUPPORTED,
  UPDATE_STATUS.CHECKING,
  UPDATE_STATUS.DOWNLOADING,
  UPDATE_STATUS.DOWNLOADED
]

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5 space-y-1">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-muted">{description}</p>
    </div>
  )
}

export function SettingsPage() {
  const update = useUpdateStore((state) => state.update)
  const autoDownload = useUpdateStore((state) => state.autoDownload)
  const { check, download, install, setAutoDownload } = useUpdateStore.getState()
  const [error, setError] = useState<string | null>(null)

  const run = (action: () => Promise<void>) => async () => {
    setError(null)
    try {
      await action()
    } catch (caught) {
      setError(getErrorMessage(caught))
    }
  }

  return (
    <>
      <PageHeader title={SETTINGS_TEXTS.PAGE_TITLE} subtitle={SETTINGS_TEXTS.PAGE_SUBTITLE} />

      <div className="flex max-w-3xl flex-col gap-8">
        <Card>
          <SectionHeader
            title={SETTINGS_TEXTS.APPEARANCE_TITLE}
            description={SETTINGS_TEXTS.APPEARANCE_DESCRIPTION}
          />
          <ThemeSwitcher variant={THEME_SWITCHER_VARIANTS.CARDS} />
        </Card>

        <Card>
          <SectionHeader
            title={SETTINGS_TEXTS.UPDATES_TITLE}
            description={SETTINGS_TEXTS.UPDATES_DESCRIPTION}
          />
          {!update || autoDownload === null ? (
            <UpdatesSectionSkeleton />
          ) : (
            <div className="flex flex-col gap-6">
              <Toggle
                label={SETTINGS_TEXTS.AUTO_DOWNLOAD_LABEL}
                hint={SETTINGS_TEXTS.AUTO_DOWNLOAD_HINT}
                checked={autoDownload}
                onChange={(value) => void run(() => setAutoDownload(value))()}
              />

              <div className="flex flex-col gap-4 rounded-neu-sm p-5 shadow-neu-inset">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                  <span>
                    {SETTINGS_TEXTS.CURRENT_VERSION}:{' '}
                    <span className="font-mono font-semibold text-ink">
                      {COMMON_TEXTS.VERSION_PREFIX}
                      {update.currentVersion}
                    </span>
                  </span>
                  {update.lastCheckedAt && (
                    <span>
                      {SETTINGS_TEXTS.LAST_CHECKED}: {formatDateTime(update.lastCheckedAt)}
                    </span>
                  )}
                </div>
                <p
                  aria-live="polite"
                  className={cn(
                    'text-sm font-semibold',
                    update.status === UPDATE_STATUS.ERROR && 'text-danger',
                    update.status === UPDATE_STATUS.DOWNLOADED && 'text-success'
                  )}
                >
                  {UPDATE_STATUS_TEXTS[update.status](update.availableVersion)}
                </p>
                {update.status === UPDATE_STATUS.DOWNLOADING && (
                  <ProgressBar
                    value={update.progress}
                    total={UPDATE_PROGRESS_MAX}
                    label={`${update.progress}%`}
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  icon={<RefreshCw className="size-4" />}
                  loading={update.status === UPDATE_STATUS.CHECKING}
                  disabled={CHECK_DISABLED.includes(update.status)}
                  onClick={run(check)}
                >
                  {SETTINGS_TEXTS.CHECK_NOW}
                </Button>
                {update.status === UPDATE_STATUS.AVAILABLE && (
                  <Button
                    variant={BUTTON_VARIANTS.PRIMARY}
                    icon={<Download className="size-4" />}
                    onClick={run(download)}
                  >
                    {SETTINGS_TEXTS.DOWNLOAD}
                  </Button>
                )}
                {update.status === UPDATE_STATUS.DOWNLOADED && (
                  <Button
                    variant={BUTTON_VARIANTS.PRIMARY}
                    icon={<RotateCcw className="size-4" />}
                    onClick={run(install)}
                  >
                    {SETTINGS_TEXTS.RESTART_AND_INSTALL}
                  </Button>
                )}
              </div>
              {error && <ErrorBanner message={error} />}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
