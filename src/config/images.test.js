import { describe, it, expect } from 'vitest'
import { srcSet, heroSlugs, heroAlt, stripSlugs } from './images'
import { manifest } from './image-manifest'
import { modules } from '../data/modules'

describe('images', () => {
  it('builds a srcSet from the manifest widths', () => {
    const { src, srcSet: set, lqip } = srcSet('hero-2')
    expect(src).toBe('/images/hero-2-1920.webp')
    expect(set).toContain('/images/hero-2-640.webp 640w')
    expect(set).toContain('/images/hero-2-1920.webp 1920w')
    expect(lqip.startsWith('data:image/webp;base64,')).toBe(true)
  })

  it('never advertises a width wider than its source', () => {
    // hero-1's photograph is 1408px wide, so it stops at 1280.
    const { src, srcSet: set } = srcSet('hero-1')
    expect(src).toBe('/images/hero-1-1280.webp')
    expect(set).not.toContain('1920w')
  })

  it('inlines a non-empty data-URI LQIP for every slug', () => {
    for (const slug of Object.keys(manifest)) {
      const { lqip } = srcSet(slug)
      expect(lqip.startsWith('data:image/webp;base64,')).toBe(true)
      expect(lqip.length).toBeGreaterThan('data:image/webp;base64,'.length)
    }
  })

  it('throws on an unknown slug rather than emitting a broken URL', () => {
    expect(() => srcSet('does-not-exist')).toThrow(/unknown image slug/)
  })

  it('has a manifest entry for every slug the modules reference', () => {
    for (const m of modules) {
      expect(() => srcSet(m.cardSlug)).not.toThrow()
      if (m.detailSlug) expect(() => srcSet(m.detailSlug)).not.toThrow()
    }
  })

  it('describes both hero frames', () => {
    expect(heroSlugs).toEqual(['hero-1', 'hero-2'])
    for (const slug of heroSlugs) expect(heroAlt[slug]).toBeTruthy()
  })

  it('gives every module a two-image photo strip, falling back to a hero frame', () => {
    for (const m of modules) {
      const slugs = stripSlugs(m)
      expect(slugs).toHaveLength(2)
      for (const slug of slugs) expect(() => srcSet(slug)).not.toThrow()
    }
    expect(stripSlugs({ cardSlug: 'inputs-card', detailSlug: 'inputs-detail' }))
      .toEqual(['inputs-card', 'inputs-detail'])
    expect(stripSlugs({ cardSlug: 'advisory-card', detailSlug: null }))
      .toEqual(['advisory-card', 'hero-2'])
  })
})
