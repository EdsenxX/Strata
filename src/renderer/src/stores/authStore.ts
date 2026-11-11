/**
 * Estado de autenticación de la interfaz.
 */
import { create } from 'zustand'
import { AUTH_STATUS, type AuthStatus } from '@shared/constants'
import type { LoginInput, RegisterInput, UserDto } from '@shared/types'
import { api, getErrorMessage, onUnauthenticated, unwrap } from '../api/client'

interface AuthState {
  status: AuthStatus
  user: UserDto | null
  /** Error al recuperar la sesión al arrancar (por ejemplo, sin conexión). */
  bootError: string | null
  bootstrap: () => Promise<void>
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

const signedOutState = { status: AUTH_STATUS.ANONYMOUS, user: null }

export const useAuthStore = create<AuthState>((set) => ({
  status: AUTH_STATUS.LOADING,
  user: null,
  bootError: null,

  bootstrap: async () => {
    try {
      const user = await unwrap(api.auth.getSession())
      set(user ? { status: AUTH_STATUS.AUTHENTICATED, user, bootError: null } : signedOutState)
    } catch (error) {
      set({ ...signedOutState, bootError: getErrorMessage(error) })
    }
  },

  login: async (input) => {
    const user = await unwrap(api.auth.login(input))
    set({ status: AUTH_STATUS.AUTHENTICATED, user, bootError: null })
  },

  register: async (input) => {
    const user = await unwrap(api.auth.register(input))
    set({ status: AUTH_STATUS.AUTHENTICATED, user, bootError: null })
  },

  logout: async () => {
    await unwrap(api.auth.logout())
    set(signedOutState)
  }
}))

onUnauthenticated(() => useAuthStore.setState(signedOutState))
