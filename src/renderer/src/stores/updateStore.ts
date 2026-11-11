/**
 * Estado de las actualizaciones y preferencia de descarga automática.
 * El proceso principal es la fuente de verdad: aquí solo se refleja lo que notifica.
 */
import { create } from 'zustand'
import type { UpdateState } from '@shared/types'
import { api, unwrap } from '../api/client'

interface UpdateStoreState {
  update: UpdateState | null
  autoDownload: boolean | null
  installOnStartup: boolean | null
  /** El usuario cerró el aviso de "actualización lista" en esta sesión. */
  bannerDismissed: boolean
  init: () => Promise<void>
  check: () => Promise<void>
  download: () => Promise<void>
  install: () => Promise<void>
  setAutoDownload: (value: boolean) => Promise<void>
  setInstallOnStartup: (value: boolean) => Promise<void>
  skipStartup: () => Promise<void>
  dismissBanner: () => void
}

let unsubscribe: (() => void) | null = null

export const useUpdateStore = create<UpdateStoreState>((set, get) => ({
  update: null,
  autoDownload: null,
  installOnStartup: null,
  bannerDismissed: false,

  init: async () => {
    unsubscribe ??= api.updates.onStateChange((update) => set({ update }))
    const [update, autoDownload, installOnStartup] = await Promise.all([
      unwrap(api.updates.getState()),
      unwrap(api.preferences.getAutoDownloadUpdates()),
      unwrap(api.preferences.getInstallOnStartup())
    ])
    set({ update, autoDownload, installOnStartup })
  },

  check: async () => {
    set({ update: await unwrap(api.updates.check()) })
  },

  download: async () => {
    set({ update: await unwrap(api.updates.download()) })
  },

  install: async () => {
    await unwrap(api.updates.install())
  },

  setAutoDownload: async (value) => {
    const previous = get().autoDownload
    set({ autoDownload: value })
    try {
      await unwrap(api.preferences.setAutoDownloadUpdates(value))
    } catch (error) {
      set({ autoDownload: previous })
      throw error
    }
  },

  setInstallOnStartup: async (value) => {
    const previous = get().installOnStartup
    set({ installOnStartup: value })
    try {
      await unwrap(api.preferences.setInstallOnStartup(value))
    } catch (error) {
      set({ installOnStartup: previous })
      throw error
    }
  },

  skipStartup: async () => {
    set({ update: await unwrap(api.updates.skipStartup()) })
  },

  dismissBanner: () => set({ bannerDismissed: true })
}))
