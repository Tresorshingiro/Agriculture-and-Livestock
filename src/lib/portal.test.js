import { describe, it, expect } from 'vitest'
import { embedUrl, PROXY_BASE, PORTAL_ORIGIN } from './portal'
import { modules } from '../data/modules'

describe('embedUrl', () => {
  it('rewrites a portal dashboard onto the proxy base', () => {
    expect(embedUrl(`${PORTAL_ORIGIN}/apps/dashboards/abc`))
      .toBe(`${PROXY_BASE}/apps/dashboards/abc`)
  })

  it('preserves the query string of an Experience Builder app', () => {
    expect(embedUrl(`${PORTAL_ORIGIN}/apps/experiencebuilder/experience/?id=xyz`))
      .toBe(`${PROXY_BASE}/apps/experiencebuilder/experience/?id=xyz`)
  })

  it('leaves a foreign URL untouched rather than proxying the open internet', () => {
    expect(embedUrl('https://example.com/x')).toBe('https://example.com/x')
    expect(embedUrl(null)).toBe(null)
  })

  it('can embed every application in the portal', () => {
    for (const m of modules) {
      for (const a of m.apps) {
        expect(embedUrl(a.url).startsWith(PROXY_BASE)).toBe(true)
      }
    }
  })
})
