import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import AuthGate from './AuthGate'

function mockSession(payload) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => payload })),
  )
}

/** Stands in for the login screen and reports the search it was reached with. */
function LoginProbe() {
  const { search } = useLocation()
  return <p>login screen{search}</p>
}

function renderAt(path) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<LoginProbe />} />
          <Route
            path="*"
            element={
              <AuthGate>
                <p>workspace</p>
              </AuthGate>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('AuthGate', () => {
  beforeEach(() => mockSession({ authenticated: false }))
  afterEach(() => vi.unstubAllGlobals())

  it('holds the boot screen while the session is still unknown', () => {
    renderAt('/')
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('workspace')).toBeNull()
  })

  it('sends an anonymous visitor to the login screen', async () => {
    renderAt('/')
    await waitFor(() => expect(screen.getByText(/login screen/)).toBeInTheDocument())
  })

  it('remembers where an anonymous visitor was headed', async () => {
    renderAt('/module/livestock/app/animal-resources-distribution?panel=1')
    await waitFor(() =>
      expect(
        screen.getByText(
          'login screen?next=' +
            encodeURIComponent('/module/livestock/app/animal-resources-distribution?panel=1'),
        ),
      ).toBeInTheDocument(),
    )
  })

  it('lets a signed-in user through', async () => {
    mockSession({ authenticated: true, user: { username: 'agri', fullName: 'Agri User' } })
    renderAt('/')
    await waitFor(() => expect(screen.getByText('workspace')).toBeInTheDocument())
  })
})
