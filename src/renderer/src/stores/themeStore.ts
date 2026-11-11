/**
 * Tema elegido por el usuario (claro, oscuro o el del sistema).
 * El proceso principal aplica el cambio; la interfaz solo refleja la opción activa.
 */
import { create } from 'zustand'
import { DEFAULT_THEME_MODE, type ThemeMode } from '@shared/constants'
import { api, unwrap } from '../api/client'

interface ThemeState {
  mode: ThemeMode
  load: () => Promise<void>
  setMode: (mode: ThemeMode) => Promise<void>
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: DEFAULT_THEME_MODE,

  load: async () => {
    try {
      set({ mode: await unwrap(api.preferences.getTheme()) })
    } catch {
      // Sin preferencia legible se mantiene el tema por defecto.
    }
  },

  setMode: async (mode) => {
    const previous = get().mode
    set({ mode })
    try {
      await unwrap(api.preferences.setTheme(mode))
    } catch {
      set({ mode: previous })
    }
  }
}))
