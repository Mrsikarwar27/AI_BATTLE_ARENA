import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchMe, getStoredToken, loginApi, logoutApi, setStoredToken, signupApi } from '@/lib/api'
import { clearConversationCache } from '@/providers/QueryProvider'
import type { User } from '@/types'

/** localStorage key for the active conversation, scoped per user. */
export function activeConversationKey(userId: string): string {
  return `aba_active_conversation_${userId}`
}

function clearAllActiveConversationKeys(): void {
  try {
    const doomed: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('aba_active_conversation_')) doomed.push(k)
    }
    doomed.forEach((k) => localStorage.removeItem(k))
  } catch {
    // storage unavailable — nothing to clear
  }
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session on app start: works via HttpOnly cookie, or stored bearer token.
  useEffect(() => {
    let cancelled = false
    async function restore() {
      try {
        const me = await fetchMe()
        if (!cancelled) setUser(me)
      } catch {
        // No valid session — clear stale token so future calls don't send it.
        if (getStoredToken()) setStoredToken(null)
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void restore()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    // Never show the previous user's cached history to the next account.
    clearConversationCache()
    clearAllActiveConversationKeys()
    const res = await loginApi({ email, password })
    setUser(res.user)
  }, [])

  const signup = useCallback(
    async (firstName: string, lastName: string, email: string, password: string) => {
      clearConversationCache()
      clearAllActiveConversationKeys()
      const res = await signupApi({ firstName, lastName, email, password })
      setUser(res.user)
    },
    []
  )

  const logout = useCallback(async () => {
    await logoutApi()
    // Privacy: drop auth + private conversation state together.
    clearConversationCache()
    clearAllActiveConversationKeys()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, isLoading, login, signup, logout }),
    [user, isLoading, login, signup, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
