import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthResponse, RegisterPayload, UserInfo } from '../types'
import { api, authToken, setAuthToken } from '../services/api'
import { useToast } from './ToastContext'

const USER_KEY = 'tuskerguard-user'

interface AuthContextValue {
  user: UserInfo | null
  token: string | null
  isAdmin: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (payload: RegisterPayload) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as UserInfo) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { push } = useToast()
  const [user, setUser] = useState<UserInfo | null>(loadUser)

  const persist = useCallback((res: AuthResponse) => {
    setAuthToken(res.token)
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    } catch {
      /* ignore */
    }
    setUser(res.user)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await api.login(email, password)
        persist(res)
        push('success', `Welcome back, ${res.user.name}`)
        return true
      } catch {
        push('error', 'Login failed', 'Invalid email or password')
        return false
      }
    },
    [persist, push],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      try {
        const res = await api.register(payload)
        persist(res)
        push('success', 'Account created', `Welcome, ${res.user.name}`)
        return true
      } catch {
        push('error', 'Registration failed', 'Email may already be registered')
        return false
      }
    },
    [persist, push],
  )

  const logout = useCallback(() => {
    setAuthToken(null)
    try {
      localStorage.removeItem(USER_KEY)
    } catch {
      /* ignore */
    }
    setUser(null)
    push('info', 'Logged out')
  }, [push])

  // Re-validate the stored token once on mount.
  useEffect(() => {
    if (!authToken()) return
    api
      .me()
      .then((me) => {
        try {
          localStorage.setItem(USER_KEY, JSON.stringify(me))
        } catch {
          /* ignore */
        }
        setUser(me)
      })
      .catch(() => logout())
  }, [logout])

  const value = useMemo<AuthContextValue>(
    () => ({ user, token: authToken(), isAdmin: !!user?.isAdmin, login, register, logout }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
