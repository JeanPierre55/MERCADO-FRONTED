/**
 * Zustand store for authentication session management.
 *
 * Persists the session in sessionStorage (never localStorage) so the
 * session is scoped to the current browser tab and is automatically
 * cleared when the tab is closed.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 4.2, 8.1
 */

import { create } from 'zustand'
import { isJwtExpired } from './jwtUtils'
import { AuthSession } from '../types/index'

const STORAGE_KEY = 'mercato-auth'

interface AuthState {
  session: AuthSession | null
  isAuthenticated: boolean
  isInitialized: boolean

  initialize: () => void
  login: (session: AuthSession) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAuthenticated: false,
  isInitialized: false,

  initialize: () => {
    const raw = sessionStorage.getItem(STORAGE_KEY)

    if (raw === null) {
      set({ session: null, isAuthenticated: false, isInitialized: true })
      return
    }

    try {
      const session: AuthSession = JSON.parse(raw)

      if (isJwtExpired(session.jwt)) {
        sessionStorage.removeItem(STORAGE_KEY)
        set({ session: null, isAuthenticated: false, isInitialized: true })
      } else {
        set({ session, isAuthenticated: true, isInitialized: true })
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY)
      set({ session: null, isAuthenticated: false, isInitialized: true })
    }
  },

  login: (session: AuthSession) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    set({ session, isAuthenticated: true })
  },

  logout: () => {
    sessionStorage.removeItem(STORAGE_KEY)
    set({ session: null, isAuthenticated: false })
  },
}))
