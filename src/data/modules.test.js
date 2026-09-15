import { describe, it, expect } from 'vitest'
import { modules, totals, getModule } from './modules'

describe('module data', () => {
  it('has six modules in the documented order', () => {
    expect(modules.map((m) => m.id)).toEqual([
      'land-profiling', 'inputs', 'crop-monitoring',
      'advisory', 'value-chain', 'livestock',
    ])
  })

  it('totals six applications and forty-four features', () => {
    expect(totals).toEqual({ modules: 6, apps: 6, features: 44 })
  })

  it('carries the documented per-module counts', () => {
    expect(modules.map((m) => m.apps.length)).toEqual([2, 1, 1, 0, 1, 1])
    expect(modules.map((m) => m.features.length)).toEqual([8, 7, 7, 8, 7, 7])
  })

  it('gives Farmer Advisory features but no applications', () => {
    const advisory = getModule('advisory')
    expect(advisory.apps).toEqual([])
    expect(advisory.features).toHaveLength(8)
  })

  it('excludes every Year 3 application', () => {
    const years = modules.flatMap((m) => m.apps.map((a) => a.year))
    expect(years).not.toContain('Year 3')
    expect(new Set(years)).toEqual(new Set(['Year 1', 'Year 2']))
  })

  it('points every application at the GeoHub portal over https', () => {
    for (const m of modules) {
      for (const a of m.apps) {
        expect(a.url.startsWith('https://gh.space.gov.rw/portal/')).toBe(true)
      }
    }
  })

  it('gives every module a unique index and card image', () => {
    expect(modules.map((m) => m.index)).toEqual(['01', '02', '03', '04', '05', '06'])
    const slugs = modules.map((m) => m.cardSlug)
    expect(new Set(slugs).size).toBe(6)
  })

  it('returns undefined for an unknown module id', () => {
    expect(getModule('nope')).toBeUndefined()
  })
})
