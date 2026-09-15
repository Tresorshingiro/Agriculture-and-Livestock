// Fails the build if the generated feature data and the module list drift apart.
// Run automatically by `npm run build`.
import { modules, totals } from '../src/data/modules.js'

const expected = { modules: 6, apps: 6, features: 44 }
const perModuleApps = [2, 1, 1, 0, 1, 1]
const perModuleFeatures = [8, 7, 7, 8, 7, 7]

const problems = []
for (const key of Object.keys(expected)) {
  if (totals[key] !== expected[key]) {
    problems.push(`totals.${key}: expected ${expected[key]}, got ${totals[key]}`)
  }
}
if (String(modules.map((m) => m.apps.length)) !== String(perModuleApps)) {
  problems.push(`per-module apps: expected ${perModuleApps}, got ${modules.map((m) => m.apps.length)}`)
}
if (String(modules.map((m) => m.features.length)) !== String(perModuleFeatures)) {
  problems.push(`per-module features: expected ${perModuleFeatures}, got ${modules.map((m) => m.features.length)}`)
}
for (const m of modules) {
  for (const a of m.apps) {
    if (!a.url.startsWith('https://gh.space.gov.rw/portal/')) {
      problems.push(`${m.id}: application URL is not on the GeoHub portal: ${a.url}`)
    }
  }
}

if (problems.length) {
  console.error('check-data failed:\n  ' + problems.join('\n  '))
  console.error('\nRe-run: python3 scripts/extract-features.py')
  process.exit(1)
}
console.log(`check-data ok: ${totals.modules} modules, ${totals.apps} applications, ${totals.features} features`)
