// All portal imagery. To swap in different photographs, change the source
// filename in scripts/prepare-images.py and re-run it. Nothing here changes
// unless a slug is added or removed. LQIPs are inlined as base64 data URIs
// rather than served as files: at 24px wide each is only 80-120 bytes, and an
// HTTP request costs far more than that payload, so paying for ten extra
// round trips would be strictly worse than paying the few hundred bytes in
// the bundle.
import { manifest, lqip } from './image-manifest.js'

const BASE = '/images'

export function srcSet(slug) {
  // The manifest lists only the widths actually written, so a source too small
  // for 1920 never advertises a file that does not exist.
  const widths = manifest[slug]
  if (!widths) throw new Error(`unknown image slug: ${slug}`)
  const uri = lqip[slug]
  if (!uri) throw new Error(`unknown image slug: ${slug}`)
  return {
    src: `${BASE}/${slug}-${widths[widths.length - 1]}.webp`,
    srcSet: widths.map((w) => `${BASE}/${slug}-${w}.webp ${w}w`).join(', '),
    lqip: uri,
  }
}

// Hero Ken Burns rotation, in order. Cool emerald drifting to warm gold.
export const heroSlugs = ['hero-1', 'hero-2']

export const heroAlt = {
  'hero-1': 'A farmer reading a crop map on a tablet among rows of green crops',
  'hero-2': 'Sunlit terraced paddies stepping down a hillside',
}

/**
 * The photographs shown on a module's detail page: its own card image, plus a
 * dedicated detail frame where one exists, otherwise a hero frame so every
 * module's strip carries two images.
 */
export function stripSlugs(module) {
  return [module.cardSlug, module.detailSlug || 'hero-2']
}
