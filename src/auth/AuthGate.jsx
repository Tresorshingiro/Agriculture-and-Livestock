import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

/**
 * Everything except /login sits behind this.
 *
 * The session lives in an HttpOnly cookie, so on a cold load we do not know
 * whether the user is signed in until the server answers. Redirecting during
 * that window would bounce an already-authenticated user to the login screen on
 * every reload, so we hold the boot screen until the answer arrives.
 */
export default function AuthGate({ children }) {
  const { user, checking } = useAuth()
  const location = useLocation()

  if (checking) {
    return (
      <div className="boot-screen" role="status" aria-live="polite">
        <span className="boot-spinner" />
        <p>Checking your GeoHub session</p>
      </div>
    )
  }

  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  return children
}
