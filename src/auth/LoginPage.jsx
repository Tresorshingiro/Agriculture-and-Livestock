import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import IconMark from '../components/IconMark'
import { portal } from '../data/config'
import { brand } from '../lib/brand'
import { useAuth } from './AuthContext'

/**
 * The gate: photograph on the left, a tinted panel with one credential card on
 * the right, in the portal's brand colour (see lib/brand.js).
 *
 * A signed-in visitor never sees this — they are sent straight on to wherever
 * they were headed, which is what `?next=` carries.
 */
export default function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const next = params.get('next') || '/'

  useEffect(() => {
    if (user) navigate(next, { replace: true })
  }, [user, next, navigate])

  async function onSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const result = await signIn(username, password)
    setBusy(false)
    if (!result.ok) setError(result.error)
  }

  return (
    <main
      className="login"
      style={{ '--login-accent': brand.accent, '--login-tint': brand.tint }}
    >
      {/* Photograph only, shown as it is. The portal's name heads the card, so
          setting it over the photo as well would say it twice. */}
      <div
        className="login-visual"
        style={{ backgroundImage: `url(${portal.hero})` }}
        aria-hidden="true"
      />

      <div className="login-panel">
        <form className="login-card" onSubmit={onSubmit}>
          <span className="login-card__badge" aria-hidden="true">
            <IconMark name={brand.icon} size={32} />
          </span>
          <h1 className="login-card__title">{portal.name}</h1>

          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              // eslint-disable-next-line jsx-a11y/no-autofocus -- the card is
              // the only thing on the screen and typing is the only action.
              autoFocus
              required
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && (
            <p className="login-card__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary login-card__submit" disabled={busy}>
            {busy && <span className="boot-spinner boot-spinner--sm" />}
            {busy ? 'Signing in' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
