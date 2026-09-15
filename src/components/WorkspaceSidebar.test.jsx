import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import WorkspaceSidebar from './WorkspaceSidebar'
import { AuthProvider } from '../auth/AuthContext'
import { modules } from '../data/config'

function renderAt(path = '/') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<WorkspaceSidebar />} />
          <Route path="/module/:moduleId/app/:solutionId" element={<WorkspaceSidebar />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('WorkspaceSidebar', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          authenticated: true,
          user: { username: 'agri', fullName: 'Agri User' },
        }),
      })),
    )
  })
  afterEach(() => vi.unstubAllGlobals())

  it('heads each module with its icon tile and short name', () => {
    const { container } = renderAt()
    for (const mod of modules) {
      const section = screen.getByRole('region', { name: mod.shortName })
      expect(section.querySelector('.navhead__tile svg')).toBeTruthy()
      expect(section.querySelector('.navhead__title').textContent).toBe(mod.shortName)
    }
    // No "Modules" label above the list: the headings speak for themselves.
    expect(container.querySelector('.sidebar__heading')).toBeNull()
  })

  it('never repeats the words Module or solution on a label', () => {
    renderAt()
    for (const mod of modules) {
      expect(mod.shortName).not.toMatch(/module/i)
      for (const solution of mod.solutions) {
        expect(solution.shortName).not.toMatch(/solution|mapping/i)
        expect(screen.getByText(solution.shortName)).toBeInTheDocument()
      }
    }
  })

  it('shows no solution counts, since every row is already on screen', () => {
    renderAt()
    expect(screen.queryByText(/^\d+ solutions?$/)).toBeNull()
  })

  it('shows every solution at once, with no disclosure to work through', () => {
    const { container } = renderAt()
    const total = modules.reduce((n, m) => n + m.solutions.length, 0)
    // Scoped to the catalog: the portal name at the top is a link as well.
    expect(container.querySelectorAll('.modlist__item')).toHaveLength(total)
    // The collapse and sign-out buttons are the only ones here; nothing in the
    // catalog expands or hides.
    for (const button of screen.getAllByRole('button')) {
      expect(button).not.toHaveAttribute('aria-expanded')
    }
  })

  it('routes each link at its own solution and keeps the full name on hover', () => {
    renderAt()
    const link = screen.getByRole('link', { name: 'Soil Information' })
    expect(link).toHaveAttribute('href', '/module/land-profiling/app/soil-information-mapping')
    expect(link).toHaveAttribute('title', 'Soil Information Mapping')
  })

  it('marks the module and the solution the URL is on', () => {
    const { container } = renderAt('/module/livestock/app/animal-resources-distribution')

    const active = container.querySelectorAll('.navsection.is-active')
    expect(active).toHaveLength(1)
    expect(active[0].textContent).toContain('Livestock')

    const current = container.querySelectorAll('.modlist__item.is-active')
    expect(current).toHaveLength(1)
    expect(current[0].textContent).toBe('Animal Resources')
  })

  it('gives every module a distinct accent for its rail', () => {
    const accents = modules.map((m) => m.accent)
    expect(new Set(accents).size).toBe(accents.length)
    for (const accent of accents) expect(accent).toMatch(/^#[0-9A-F]{6}$/i)
  })

  it('never lists a module whose application is not live', () => {
    renderAt()
    expect(screen.queryByText(/Farmer Advisory/)).toBeNull()
    expect(screen.queryByText(/Coming soon/i)).toBeNull()
  })
})
