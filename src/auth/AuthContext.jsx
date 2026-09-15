import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * Authentication against GeoHub, brokered by this portal's own server.
 *
 * Credentials are posted to /api/auth/login on this origin. The server
 * exchanges them with gh.space.gov.rw for a portal token, keeps that token in a
 * signed HttpOnly cookie, and attaches it to every proxied request. The token
 * is never sent to the browser, so nothing here can leak it — this context only
 * ever sees who the user is, never their credentials or token.
 */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  // Ask the server who we are. The session lives in an HttpOnly cookie, so this
  // is the only way the client can find out.
  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', { credentials: 'include' })
      const data = await res.json()
      setUser(data.authenticated ? data.user : null)
    } catch {
      setUser(null)
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      user,
      checking,
      async signIn(username, password) {
        if (!String(username || '').trim() || !String(password || '')) {
          return { ok: false, error: 'Enter your GeoHub username and password.' }
        }
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok || !data.authenticated) {
            return { ok: false, error: data.error || 'Invalid username or password.' }
          }
          setUser(data.user)
          return { ok: true }
        } catch {
          return { ok: false, error: 'Could not reach the portal server. Is it running?' }
        }
      },
      async signOut() {
        try {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
        } finally {
          setUser(null)
        }
      },
    }),
    [user, checking],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider')
  return ctx
}
