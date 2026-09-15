import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Layout from './Layout'
import Workspace from './Workspace'
import HomePage from '../pages/HomePage'
import AppViewer from '../pages/AppViewer'
import LegalPage from '../pages/LegalPage'
import { AuthProvider } from '../auth/AuthContext'
import { portal } from '../data/config'

function renderAt(path, width = 1400) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: width >= 961 && query.includes('961'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }))

  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<Layout />}>
            <Route element={<Workspace />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/module/:moduleId/app/:solutionId" element={<AppViewer />} />
            </Route>
            <Route path="/legal/:page" element={<LegalPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('Layout', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ authenticated: true, user: { username: 'agri', fullName: 'Agri User' } }),
      })),
    )
  })
  afterEach(() => vi.unstubAllGlobals())

  it('has no header at all — the portal name is carried by the sidebar', () => {
    const { container } = renderAt('/')
    expect(container.querySelector('.site-header')).toBeNull()
    const brand = container.querySelector('.workspace-sidebar .sidebar__name')
    expect(brand.textContent).toBe(portal.name)
    expect(brand.textContent).not.toBe(portal.shortName)
    // "GeoHub" was a subtitle beside it; it now appears only in the footer.
    expect(container.querySelector('.brand-sub')).toBeNull()
    expect(container.querySelector('.workspace-sidebar').textContent).not.toContain('GeoHub')
  })

  it('puts the signed-in user and the way out at the foot of the sidebar', async () => {
    const { container } = renderAt('/')
    const foot = container.querySelector('.workspace-sidebar .sidebar__foot')
    expect(foot.querySelector('.logout').textContent).toBe('Logout')
    // The session is answered by the server, so the name lands after the first
    // paint rather than with it.
    expect(await screen.findByText('Agri User')).toHaveClass('account__name')
    expect(foot.querySelector('.account__avatar').textContent).toBe('A')
  })

  it('marks the brand with an icon badge, never an agency logo image', () => {
    const { container } = renderAt('/')
    const brand = container.querySelector('.sidebar__brand')
    expect(brand.querySelector('.sidebar__badge svg')).toBeTruthy()
    expect(brand.querySelector('img')).toBeNull()
    expect(container.querySelector('.logomark')).toBeNull()
  })

  it('locks the workspace shell to one viewport and gives it no footer', () => {
    const { container } = renderAt('/')
    expect(container.querySelector('.shell')).toHaveClass('shell--workspace')
    expect(container.querySelector('.main')).toBeTruthy()
    expect(container.querySelector('.site-footer')).toBeNull()
  })

  it('collapses from inside the sidebar and reopens from the floating button', async () => {
    const user = userEvent.setup()
    const { container } = renderAt('/')
    expect(container.querySelector('.workspace')).toHaveClass('is-nav-open')
    // While the column is open there is nothing floating over the pane.
    expect(screen.queryByRole('button', { name: 'Open modules menu' })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Collapse modules menu' }))
    expect(container.querySelector('.workspace')).toHaveClass('is-nav-closed')
    // The pane is still there at full height — collapsing hides the column, it
    // does not unmount the map.
    expect(container.querySelector('.workspace-pane')).toBeTruthy()

    // The collapse control went with the sidebar, so the way back has to live
    // outside it.
    const reopen = screen.getByRole('button', { name: 'Open modules menu' })
    expect(reopen).toHaveClass('nav-reopen')
    await user.click(reopen)
    expect(container.querySelector('.workspace')).toHaveClass('is-nav-open')
  })

  it('starts closed on a narrow screen', () => {
    const { container } = renderAt('/', 800)
    expect(container.querySelector('.workspace')).toHaveClass('is-nav-closed')
  })

  it('keeps the desktop sidebar open when a map is chosen', () => {
    const { container } = renderAt('/module/livestock/app/animal-resources-distribution')
    expect(container.querySelector('.workspace')).toHaveClass('is-nav-open')
    expect(container.querySelector('.app-frame')).toBeTruthy()
  })

  it('gives legal pages the footer, and no sidebar or collapse button', () => {
    const { container } = renderAt('/legal/privacy')
    expect(container.querySelector('.shell')).toHaveClass('shell--page')
    expect(container.querySelector('.workspace-sidebar')).toBeNull()
    expect(screen.queryByRole('button', { name: /modules menu/ })).toBeNull()
    expect(container.querySelector('.site-footer')).toBeTruthy()
    expect(screen.getByText('© 2026 Rwanda Space Agency')).toBeInTheDocument()
  })
})
