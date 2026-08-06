import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthResponse, RegisterPayload, UserInfo } from '../types'
import { api, authToken, setAuthToken, ApiError } from '../services/api'
import { firebaseSignIn, firebaseSignOut, firebaseSignUp } from '../services/firebase'
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
      // 1) Try Firebase Auth first (real user accounts).
      try {
        const idToken = await firebaseSignIn(email.trim(), password)
        const res = await api.firebaseLogin(idToken)
        persist(res)
        push('success', `Welcome back, ${res.user.name}`)
        return true
      } catch (err) {
        // 2) Fall back to the built-in backend login (demo accounts, offline backend).
        if (!(err instanceof ApiError)) {
          try {
            const res = await api.login(email.trim(), password)
            persist(res)
            push('success', `Welcome back, ${res.user.name}`)
            return true
          } catch (legacyErr) {
            if (legacyErr instanceof ApiError && legacyErr.status === 401) {
              push('error', 'Login failed', 'Invalid email or password')
            } else {
              push('error', 'Cannot reach server', 'The backend may still be starting — wait a few seconds and retry.')
            }
            return false
          }
        }
        if (err.status === 401) {
          push('error', 'Login failed', 'Invalid email or password')
        } else {
          push('error', 'Cannot reach server', 'The backend may still be starting — wait a few seconds and retry.')
        }
        return false
      }
    },
    [persist, push],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      // 1) Create the account in Firebase Auth.
      try {
        const { idToken } = await firebaseSignUp(payload.email, payload.password)
        // 2) Complete registration in the backend (stores profile + issues app JWT).
        const res = await api.firebaseRegister(idToken, payload)
        persist(res)
        push('success', 'Account created', `Welcome, ${res.user.name}`)
        return true
      } catch (err) {
        if (err instanceof ApiError) {
          push('error', 'Registration failed', err.status === 409 ? 'Email may already be registered' : 'Backend not reachable')
        } else {
          const code = (err as { code?: string })?.code ?? ''
          if (code === 'auth/email-already-in-use') push('error', 'Registration failed', 'This email is already registered')
          else if (code === 'auth/weak-password') push('error', 'Registration failed', 'Password must be at least 6 characters')
          else push('error', 'Registration failed', 'Check that Email/Password sign-in is enabled in Firebase Console')
        }
        return false
      }
    },
    [persist, push],
  )

  const logout = useCallback(() => {
    firebaseSignOut()
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
