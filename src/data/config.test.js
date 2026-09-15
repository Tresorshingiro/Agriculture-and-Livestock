import { describe, it, expect } from 'vitest'
import { modules, catalogModules, stats, footer, portal, getSolution } from './config'
import { PROXY_BASE } from '../lib/portal'

describe('workspace config', () => {
  it('publishes only modules that have a live solution', () => {
    // Farmer Advisory has no application in this delivery, so it is not in the
    // workspace at all — no empty category, no coming-soon row.
    expect(catalogModules.map((m) => m.id)).toContain('advisory')
    expect(modules.map((m) => m.id)).toEqual(['land-profiling', 'livestock'])
  })

  it('withdraws inputs distribution, crops health and export supply chain', () => {
    // Still in the catalog, so check-data keeps matching the workbook; just not
    // published. Their modules are left empty and drop out like Advisory.
    const all = catalogModules.flatMap((m) => m.solutions.map((s) => s.id))
    const live = modules.flatMap((m) => m.solutions.map((s) => s.id))
    for (const id of [
      'farming-inputs-distribution', 'crops-health-monitoring', 'export-crops-supply-chain',
    ]) {
      expect(all).toContain(id)
      expect(live).not.toContain(id)
    }
    expect(getSolution('inputs', 'farming-inputs-distribution')).toBeUndefined()
  })

  it('hides any solution that cannot be embedded', () => {
    for (const mod of modules) {
      for (const solution of mod.solutions) {
        expect(solution.embedUrl).toBeTruthy()
      }
    }
  })

  it('counts published solutions only', () => {
    expect(stats).toEqual({ modules: 2, solutions: 3 })
  })

  it('embeds every solution same-origin, never straight at GeoHub', () => {
    for (const mod of modules) {
      for (const solution of mod.solutions) {
        expect(solution.embedUrl.startsWith(PROXY_BASE)).toBe(true)
        expect(solution.embedUrl).not.toContain('gh.space.gov.rw')
      }
    }
  })

  it('gives every solution a stable id the sidebar can route to', () => {
    const ids = modules.flatMap((m) => m.solutions.map((s) => s.id))
    expect(new Set(ids).size).toBe(ids.length)
    expect(getSolution('livestock', 'animal-resources-distribution')).toBeTruthy()
    expect(getSolution('advisory', 'anything')).toBeUndefined()
  })

  it('uses the full portal name, with no subtitle behind it', () => {
    expect(portal.name).toBe('Agriculture and Livestock Management')
    expect(portal.name).not.toBe(portal.shortName)
    expect(portal.description).toBeUndefined()
  })

  it('quick-links home plus live applications only', () => {
    expect(footer.quickLinks[0]).toEqual({ label: 'Home', to: '/' })
    const routes = footer.quickLinks.slice(1).map((l) => l.to)
    expect(routes).toHaveLength(3)
    for (const route of routes) {
      const [, , moduleId, , solutionId] = route.split('/')
      expect(getSolution(moduleId, solutionId)).toBeTruthy()
    }
    expect(routes.some((r) => r.includes('advisory'))).toBe(false)
  })

  it('leaves contact details empty and carries the agreed copyright', () => {
    expect(footer.contact).toEqual({ email: '', phone: '' })
    expect(footer.copyright).toBe('© 2026 Rwanda Space Agency')
  })
})
