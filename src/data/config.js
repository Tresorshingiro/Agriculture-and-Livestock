/**
 * Workspace configuration.
 *
 * The catalog itself still lives in `modules.js`, generated against the source
 * workbook and guarded by `scripts/check-data.mjs`. This module is the view of
 * that catalog the workspace actually renders: it attaches an icon and a
 * same-origin `embedUrl` to every solution, then publishes only the ones that
 * can really be opened.
 */
import { modules as catalog } from './modules.js'
import { srcSet } from '../config/images.js'
import { embedUrl } from '../lib/portal.js'

export const portal = {
  name: 'Agriculture and Livestock Management',
  shortName: 'Agriculture & Livestock',
  eyebrow: 'National Geoportal',
  homeTitle: 'Agriculture and Livestock Management',
  tagline:
    'Parcel-level soil, crop health, livestock populations and export supply chains — mapped for the whole of Rwanda.',
  homeLead: 'Choose a module on the left, then open a solution.',
  hero: srcSet('hero-1').src,
}

// Icons are keyed by module id and by solution id, so the sidebar never has to
// guess. Every name here must exist in components/IconMark.jsx.
const MODULE_ICONS = {
  'land-profiling': 'parcel',
  inputs: 'inputs',
  'crop-monitoring': 'satellite',
  advisory: 'advisory',
  'value-chain': 'route',
  livestock: 'livestock',
}

const SOLUTION_ICONS = {
  'soil-information-mapping': 'layers',
  'land-profiling-crops-suitability': 'parcel',
  'farming-inputs-distribution': 'inputs',
  'crops-health-monitoring': 'satellite',
  'export-crops-supply-chain': 'route',
  'animal-resources-distribution': 'livestock',
}

/**
 * Sidebar labels.
 *
 * The catalog names are the full titles from the source workbook and run to
 * seven words. Stacked in a 300px column they wrapped to three lines each and
 * the list stopped being scannable — and every row repeated the word the
 * heading above it already carried. These are the short forms the sidebar
 * shows; the full name stays on `solution.name`, on the link's `title`, and in
 * the footer's quick links.
 */
const MODULE_SHORT_NAMES = {
  'land-profiling': 'Land Profiling',
  inputs: 'Agriculture Inputs',
  'crop-monitoring': 'Crop Monitoring',
  advisory: 'Farmer Advisory',
  'value-chain': 'Value Chain',
  livestock: 'Livestock',
}

const SOLUTION_SHORT_NAMES = {
  'soil-information-mapping': 'Soil Information',
  'land-profiling-crops-suitability': 'Crops Suitability',
  'farming-inputs-distribution': 'Inputs Distribution',
  'crops-health-monitoring': 'Crops Health',
  'export-crops-supply-chain': 'Export Supply Chain',
  'animal-resources-distribution': 'Animal Resources',
}

/**
 * Module accents, chosen for the dark field ground the workspace is set on.
 *
 * The rail beside each group is the only thing separating one module from the
 * next now that the bordered cards are gone, so each hue has to be distinct
 * from its neighbours and legible on `#0A1410`. The set reads as a season:
 * ochre soil, the teal of irrigation, a young crop's lime, orange for trade
 * and rose for the herd. Lime is far enough off the chrome's leaf green to
 * stay a signal rather than blending into the shell.
 */
const MODULE_ACCENTS = {
  'land-profiling': '#E0A54A',
  inputs: '#2DD4BF',
  'crop-monitoring': '#A3E635',
  advisory: '#C4B5FD',
  'value-chain': '#FB923C',
  livestock: '#F19BB4',
}

/** The same accent at low alpha, for the active row's tint. */
function softAccent(hex, alpha) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Solutions withdrawn from the workspace.
 *
 * They stay in `modules.js`, which check-data holds to the source workbook, and
 * are simply not published: no `embedUrl`, so `publishedModules` drops them, and
 * a module they leave empty drops out the same way Farmer Advisory does. Delete
 * an id here to bring its application back.
 */
const WITHDRAWN_SOLUTIONS = new Set([
  'farming-inputs-distribution',
  'crops-health-monitoring',
  'export-crops-supply-chain',
])

/**
 * Every solution gets the proxied, same-origin address it is embedded from.
 * `embedUrl` maps a GeoHub URL onto this portal's proxy; a solution the proxy
 * cannot serve, or one withdrawn above, gets no `embedUrl` and is dropped by
 * `publishedModules` below.
 */
function describe(mod) {
  const accent = MODULE_ACCENTS[mod.id] || '#38BDF8'
  return {
    id: mod.id,
    name: mod.name,
    shortName: MODULE_SHORT_NAMES[mod.id] || mod.name,
    description: mod.description,
    icon: MODULE_ICONS[mod.id] || 'layers',
    accent,
    accentSoft: softAccent(accent, 0.18),
    image: srcSet(mod.cardSlug).src,
    imageAlt: mod.cardAlt,
    solutions: mod.apps.map((app) => ({
      id: app.id,
      name: app.name,
      shortName: SOLUTION_SHORT_NAMES[app.id] || app.name,
      year: app.year,
      icon: SOLUTION_ICONS[app.id] || 'map',
      embedUrl: WITHDRAWN_SOLUTIONS.has(app.id) ? null : embedUrl(app.url),
    })),
  }
}

export const catalogModules = catalog.map(describe)

/**
 * Publish only what a user can actually open. A solution with no `embedUrl` is
 * hidden, and a module left with no solutions is hidden entirely — Farmer
 * Advisory, whose application is a later phase, disappears from the workspace
 * rather than showing a dead row.
 */
function publishedModules(list) {
  return list
    .map((mod) => ({
      ...mod,
      solutions: mod.solutions.filter((app) => Boolean(app.embedUrl)),
    }))
    .filter((mod) => mod.solutions.length > 0)
}

export const modules = publishedModules(catalogModules)

export const stats = {
  modules: modules.length,
  solutions: modules.reduce((n, m) => n + m.solutions.length, 0),
}

export const getModule = (id) => modules.find((m) => m.id === id)

export const getSolution = (moduleId, solutionId) =>
  getModule(moduleId)?.solutions.find((s) => s.id === solutionId)

export const footer = {
  brandBlurb:
    'Mapping applications for the agriculture and livestock sector, served from the national GeoHub and opened inside this workspace under your own account.',
  // Left empty on purpose: nothing is published here until the agency supplies
  // a real address. The footer renders each line only when it is set.
  contact: {
    email: '',
    phone: '',
  },
  // Home plus the live solutions only — a quick link never points at an
  // application that was filtered out above.
  quickLinks: [
    { label: 'Home', to: '/' },
    ...modules.flatMap((mod) =>
      mod.solutions.map((solution) => ({
        label: solution.name,
        to: `/module/${mod.id}/app/${solution.id}`,
      })),
    ),
  ],
  legalLinks: [
    { label: 'Data Disclaimer', to: '/legal/disclaimer' },
    { label: 'Privacy', to: '/legal/privacy' },
    { label: 'Terms of Use', to: '/legal/terms' },
    { label: 'Accessibility', to: '/legal/accessibility' },
  ],
  updatedNote: 'Last updated: each mapping application shows its own data refresh time.',
  copyright: '© 2026 Rwanda Space Agency',
}
