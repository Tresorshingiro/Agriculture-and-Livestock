import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AppViewer from './AppViewer'
import HomePage from './HomePage'
import { PROXY_BASE } from '../lib/portal'

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/module/:moduleId/app/:solutionId" element={<AppViewer />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AppViewer', () => {
  it('gives the frame the whole pane, with no title strip above it', () => {
    const { container } = renderAt('/module/livestock/app/animal-resources-distribution')
    // The sidebar names the open solution and the application carries its own
    // heading; a strip here repeated both.
    expect(screen.queryByText(/Module$/)).toBeNull()
    expect(screen.queryByText(/solution$/)).toBeNull()
    expect(container.querySelector('.viewer--pane').children).toHaveLength(1)
  })

  it('frames the same-origin proxy path, never the GeoHub URL', () => {
    renderAt('/module/livestock/app/animal-resources-distribution')
    const frame = screen.getByTitle('Animal Resources Distribution Mapping')
    expect(frame.getAttribute('src')).toBe(
      `${PROXY_BASE}/apps/dashboards/438e024e293142ca996a1e7ab3afa78c`,
    )
    expect(frame.getAttribute('src')).not.toContain('gh.space.gov.rw')
    expect(frame).toHaveClass('app-frame')
  })

  it('offers no breadcrumbs, no picker and no way back to the original', () => {
    renderAt('/module/land-profiling/app/soil-information-mapping')
    expect(screen.getByTitle('Soil Information Mapping')).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).toBeNull()
    expect(screen.queryByText(/Open original/i)).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('sends an unknown module or solution home rather than rendering a dead frame', () => {
    renderAt('/module/advisory/app/anything')
    expect(screen.queryByRole('iframe')).toBeNull()
    expect(screen.getByText(/Open a module on the left/)).toBeInTheDocument()

    // A withdrawn solution is no different: its old link goes home.
    renderAt('/module/value-chain/app/export-crops-supply-chain')
    expect(screen.queryByTitle('Export Crops Supply Chain Mapping')).toBeNull()

    renderAt('/module/livestock/app/not-a-solution')
    expect(screen.getAllByText(/Open a module on the left/).length).toBeGreaterThan(0)
  })
})
