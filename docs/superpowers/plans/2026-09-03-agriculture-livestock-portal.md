# Agriculture and Livestock Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A light, editorial launcher for the Rwanda Space Agency's Agriculture and Livestock Management Application: sign in once against GeoHub, browse 6 modules, open 6 ArcGIS applications inside the portal.

**Architecture:** React SPA on Vite with a Node access server mounted as Vite middleware. The server exchanges GeoHub credentials for a portal token, keeps it in a signed HttpOnly cookie, and proxies ArcGIS apps same-origin so they can be framed. Module content is generated from a spreadsheet, never typed.

**Tech Stack:** React 19, Vite 8, Tailwind 3, Framer Motion 13, react-router-dom 7 (HashRouter), Vitest + testing-library + jsdom, Python 3 with openpyxl and Pillow for the two generators.

**Spec:** `docs/superpowers/specs/2026-09-03-agriculture-livestock-portal-design.md`

**Reference implementation:** `/home/treasure/Documents/projects2/Natural-resource` — a sibling portal with the same server, image pipeline and data-generation patterns. Read its files when a task says to port from it. Its visual language is the opposite of this one and must NOT be copied.

## Global Constraints

- Project root: `/home/treasure/Documents/projects2/Agriculture-Livestock`.
- Totals are exactly **6 modules, 6 applications, 44 features**. Per-module features: 8, 7, 7, 8, 7, 7. Per-module apps: 2, 1, 1, 0, 1, 1.
- Year 3 applications are OUT OF SCOPE. Only Year 1 and Year 2 apps appear.
- Palette, exact values: bone `#F7F4EC`, band `#EFEADC`, surface `#FFFDF7`, hairline `#E0D9C7`, soil `#241C14`, muted `#6E6153`, gold `#C8912F`, green `#3C6B3F`, clay `#9A5B3A`, onDark `#F2EDE1`.
- Gold `#C8912F` takes exactly ONE role per view. Never a second.
- Fonts: Fraunces (display), Inter Tight (UI). Self-hosted variable woff2 in `/public/fonts`. No CDN links.
- Border radius is 2px. Zero box-shadows anywhere.
- Forbidden: all-caps eyebrow labels above headings, gradient washes as decoration, arrow glyphs appended to button text, emoji icons.
- Every animation gated on Framer Motion's `useReducedMotion`.
- Server config is never `VITE_` prefixed. Secrets never reach the browser.
- Session cookie name is `rsa_agri_session`.
- Do NOT run `git commit` or `git push`. The user commits. Commit steps below are written as commands for the user to run.

---

### Task 1: Project scaffold and design tokens

**Files:**
- Create: `package.json`, `vite.config.js`, `vitest.config.js`, `postcss.config.js`, `tailwind.config.js`, `index.html`, `.gitignore`, `.env.example`
- Create: `src/main.jsx`, `src/index.css`, `src/test/setup.js`
- Create: `public/fonts/Fraunces-Variable.woff2`, `public/fonts/InterTight-Variable.woff2`

**Interfaces:**
- Consumes: nothing.
- Produces: Tailwind theme keys used by every later task — colors `bone`, `band`, `surface`, `hairline`, `soil`, `muted`, `gold`, `green`, `clay`, `onDark`; font families `display` (Fraunces) and `sans` (Inter Tight); `borderRadius.card` = `2px`; `transitionTimingFunction.editorial`. Also the `.tabular` base class.

- [ ] **Step 1: Initialise the project**

```bash
cd /home/treasure/Documents/projects2/Agriculture-Livestock
git init
npm init -y
npm install react@^19 react-dom@^19 react-router-dom@^7 framer-motion@^13
npm install -D vite@^8 @vitejs/plugin-react@^6 tailwindcss@^3 postcss autoprefixer \
  vitest@^4 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Download the two variable fonts**

```bash
mkdir -p public/fonts
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
curl -s -A "$UA" "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700" \
  | grep -o 'https://fonts.gstatic.com[^)]*\.woff2' | head -1 \
  | xargs curl -s -o public/fonts/Fraunces-Variable.woff2
curl -s -A "$UA" "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400..600" \
  | grep -o 'https://fonts.gstatic.com[^)]*\.woff2' | head -1 \
  | xargs curl -s -o public/fonts/InterTight-Variable.woff2
ls -la public/fonts
```

Expected: two files, each well over 20 KB. If either is under 5 KB the download failed — the Google CSS endpoint returns a static-format fallback for unrecognised user agents, which is why the UA string above is required.

- [ ] **Step 3: Write `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bone:     '#F7F4EC',
        band:     '#EFEADC',
        surface:  '#FFFDF7',
        hairline: '#E0D9C7',
        soil:     '#241C14',
        muted:    '#6E6153',
        gold:     '#C8912F',
        green:    '#3C6B3F',
        clay:     '#9A5B3A',
        onDark:   '#F2EDE1',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans:    ['Inter Tight', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '2px' },
      transitionTimingFunction: { editorial: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: Write `src/index.css`**

```css
@font-face {
  font-family: 'Fraunces';
  src: url('/fonts/Fraunces-Variable.woff2') format('woff2-variations');
  font-weight: 300 700;
  font-display: swap;
}
@font-face {
  font-family: 'Inter Tight';
  src: url('/fonts/InterTight-Variable.woff2') format('woff2-variations');
  font-weight: 400 600;
  font-display: swap;
}

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { scroll-behavior: smooth; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
  }
  body {
    @apply bg-bone text-soil font-sans antialiased;
  }
  /* Numerals must not wobble in counters, module indices, or stats. */
  .tabular { font-variant-numeric: tabular-nums; }
  /* Focus is always visible; never set outline:none without a replacement. */
  :focus-visible {
    @apply outline-none ring-2 ring-soil ring-offset-2 ring-offset-bone;
  }
}
```

- [ ] **Step 5: Write the remaining config files**

`postcss.config.js`:
```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
```

`vitest.config.js`:
```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test/setup.js'] },
})
```

`src/test/setup.js`:
```js
import '@testing-library/jest-dom/vitest'
```

`vite.config.js` — the server plugin import is added in Task 8; for now:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5174, strictPort: true },
  preview: { port: 4174 },
})
```

Ports are 5174/4174, not 5173/4173, so this portal can run alongside `Natural-resource` without a port clash.

`.gitignore`:
```
node_modules
dist
.env
.certs
```

`index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agriculture and Livestock Management — Rwanda Space Agency</title>
    <meta name="description" content="Rwanda's national geoportal for agriculture and livestock: six modules, six live mapping applications, parcel to export." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

`src/main.jsx`:
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>,
)
```

- [ ] **Step 6: Add npm scripts to `package.json`**

```json
"type": "module",
"scripts": {
  "dev": "vite",
  "build": "node scripts/check-data.mjs && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "check:data": "node scripts/check-data.mjs",
  "start": "NODE_ENV=production node server/index.js"
}
```

- [ ] **Step 7: Verify the toolchain**

Run: `npx vitest run --passWithNoTests`
Expected: PASS, no tests found.

- [ ] **Step 8: Commit (give these commands to the user; do not run them)**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + Tailwind with editorial design tokens"
```

---

### Task 2: Feature extraction from the spreadsheet

**Files:**
- Create: `source-data/2nd_year_EA_Applications_1.xlsx` (copied)
- Create: `scripts/extract-features.py`
- Create: `src/data/features.generated.js` (generated output, committed)

**Interfaces:**
- Consumes: Tailwind scaffold from Task 1 (not directly).
- Produces: `export const features` from `src/data/features.generated.js`, an object with exactly these keys, each an array of strings: `landProfiling` (8), `inputs` (7), `cropMonitoring` (7), `advisory` (8), `valueChain` (7), `livestock` (7).

Note the keys are camelCase here but module ids are kebab-case (`land-profiling`). This is deliberate: the generated file must be valid JS without quoted keys. `modules.js` maps between them explicitly.

- [ ] **Step 1: Copy the workbook into the repo**

```bash
mkdir -p source-data scripts src/data
cp "/home/treasure/Downloads/2nd year EA Applications 1.xlsx" source-data/2nd_year_EA_Applications_1.xlsx
```

- [ ] **Step 2: Write `scripts/extract-features.py`**

```python
"""Generate src/data/features.generated.js from the source spreadsheet.

Run:  python3 scripts/extract-features.py
The 44 feature strings are never retyped by hand; this is their only
transcription. The spreadsheet merges cells down, so a blank Proposed
Application or Module cell means "same as the row above" — hence the carry
variables below.
"""
import json
import re

import openpyxl

SRC = "source-data/2nd_year_EA_Applications_1.xlsx"
OUT = "src/data/features.generated.js"
TARGET = "Agriculture and Livestock Management Application"

# Spreadsheet module name -> the key used in features.generated.js.
KEYS = {
    "Agricultural Land Profiling": "landProfiling",
    "Agriculture Inputs Management": "inputs",
    "Crop Monitoring and Forecasting": "cropMonitoring",
    "Farmer Advisory": "advisory",
    "Agricultural Value Chain Mapping": "valueChain",
    "Livestock Information Mapping": "livestock",
}

ws = openpyxl.load_workbook(SRC, data_only=True).active
app = module = None
features = {}

for row in ws.iter_rows(min_row=2, values_only=True):
    if row[1]:
        app = row[1]
    if row[2]:
        module = row[2]
    if app != TARGET or not row[5]:
        continue
    features[KEYS[module]] = [
        re.sub(r"^\d+\.\s*", "", line).strip()
        for line in str(row[5]).split("\n")
        if line.strip()
    ]

total = sum(len(v) for v in features.values())
assert len(features) == 6, f"expected 6 modules, got {len(features)}"
assert total == 44, f"expected 44 features, got {total}"

# Emit in a stable order so the generated file does not churn.
order = ["landProfiling", "inputs", "cropMonitoring", "advisory", "valueChain", "livestock"]
body = ",\n".join(
    f"  {k}: " + json.dumps(features[k], indent=2, ensure_ascii=False).replace("\n", "\n  ")
    for k in order
)

with open(OUT, "w") as f:
    f.write(
        "// GENERATED by scripts/extract-features.py - do not edit by hand.\n"
        f"// Source: {SRC}\n"
        f"// {len(features)} modules, {total} features.\n\n"
        "export const features = {\n" + body + ",\n}\n"
    )

print(f"wrote {OUT}: {len(features)} modules, {total} features")
```

- [ ] **Step 3: Run it and verify the counts**

Run: `python3 scripts/extract-features.py`
Expected: `wrote src/data/features.generated.js: 6 modules, 44 features`

If openpyxl is missing: `pip3 install --user openpyxl`

- [ ] **Step 4: Spot-check the output**

Run:
```bash
node -e "import('./src/data/features.generated.js').then(m=>{
  const f=m.features
  console.log(Object.entries(f).map(([k,v])=>k+':'+v.length).join(' '))
  console.log(f.landProfiling[0])
})"
```
Expected: `landProfiling:8 inputs:7 cropMonitoring:7 advisory:8 valueChain:7 livestock:7`, then a line beginning `Interactive parcel-level web map with soil, terrain,` — with no leading `1.` and no tab.

- [ ] **Step 5: Commit**

```bash
git add source-data scripts/extract-features.py src/data/features.generated.js
git commit -m "feat: generate module features from the EA applications workbook"
```

---

### Task 3: Module data and its integrity test

**Files:**
- Create: `src/data/modules.js`
- Test: `src/data/modules.test.js`

**Interfaces:**
- Consumes: `features` from `src/data/features.generated.js` (Task 2).
- Produces:
  - `export const modules` — array of 6 objects, each `{ id, index, name, description, cardSlug, detailSlug, cardAlt, apps, features }` where `apps` is an array of `{ name, url, year }` and `detailSlug` may be `null`.
  - `export const totals` — `{ modules: 6, apps: 6, features: 44 }`.
  - `export const getModule = (id) => module | undefined`.
  - Module ids, in order: `land-profiling`, `inputs`, `crop-monitoring`, `advisory`, `value-chain`, `livestock`.

- [ ] **Step 1: Write the failing test**

`src/data/modules.test.js`:
```js
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/data/modules.test.js`
Expected: FAIL — cannot resolve `./modules`.

- [ ] **Step 3: Write `src/data/modules.js`**

```js
import { features } from './features.generated.js'

const GEOHUB = 'https://gh.space.gov.rw/portal'

/**
 * Module metadata. Feature lists are NEVER written here — they come from the
 * spreadsheet via extract-features.py. Only Year 1 and Year 2 applications
 * appear; Year 3 is out of scope for this delivery.
 */
export const modules = [
  {
    id: 'land-profiling',
    index: '01',
    name: 'Agricultural Land Profiling',
    description: 'Parcel-level soil, terrain and crop suitability.',
    cardSlug: 'land-profiling-card',
    detailSlug: null,
    cardAlt: 'Crop rows converging toward the horizon at golden hour',
    apps: [
      {
        name: 'Soil Information Mapping',
        url: `${GEOHUB}/apps/dashboards/bb2735551a6648a1ba5ede6655b1212c`,
        year: 'Year 1',
      },
      {
        name: 'Agriculture Land Profiling and Crops Suitability',
        url: `${GEOHUB}/apps/dashboards/b25b3af776574dc8a7f521af5e0f3487`,
        year: 'Year 1',
      },
    ],
    features: features.landProfiling,
  },
  {
    id: 'inputs',
    index: '02',
    name: 'Agriculture Inputs Management',
    description: 'Seed and fertiliser requests, approvals and distribution.',
    cardSlug: 'inputs-card',
    detailSlug: 'inputs-detail',
    cardAlt: 'A tractor drawing an applicator rig across a young crop field',
    apps: [
      {
        name: 'Farming Inputs Distribution Mapping',
        url: `${GEOHUB}/apps/experiencebuilder/experience/?id=7c6fcc2f06104a07a5e20043c5c16536`,
        year: 'Year 2',
      },
    ],
    features: features.inputs,
  },
  {
    id: 'crop-monitoring',
    index: '03',
    name: 'Crop Monitoring and Forecasting',
    description: 'Satellite crop health, climate risk and yield forecasts.',
    cardSlug: 'crop-monitoring-card',
    detailSlug: null,
    cardAlt: 'Young maize seedlings rising from dark soil, backlit',
    apps: [
      {
        name: 'Crops Health Monitoring and Mapping',
        url: `${GEOHUB}/apps/experiencebuilder/experience/?id=09c89ab217e54c829b691069c2049b79`,
        year: 'Year 2',
      },
    ],
    features: features.cropMonitoring,
  },
  {
    id: 'advisory',
    index: '04',
    name: 'Farmer Advisory',
    description: 'Parcel-based advice, extension officer routing and a knowledge base.',
    cardSlug: 'advisory-card',
    detailSlug: null,
    cardAlt: 'A farmer pouring harvested grain between her hands',
    // Deliberately empty. The advisory application is a later phase; the module
    // is shown for its capabilities, not as a broken link. See ModuleCard and
    // ModuleView for how a zero-application module renders.
    apps: [],
    features: features.advisory,
  },
  {
    id: 'value-chain',
    index: '05',
    name: 'Agricultural Value Chain Mapping',
    description: 'Farm-to-export traceability and logistics.',
    cardSlug: 'value-chain-card',
    detailSlug: null,
    cardAlt: 'Workers carrying harvest crates through a field at dawn',
    apps: [
      {
        name: 'Export Crops Supply Chain Mapping',
        url: `${GEOHUB}/apps/knowledge-studio/main?id=06b93d69b902438e9f70c2cbc8e676b3`,
        year: 'Year 2',
      },
    ],
    features: features.valueChain,
  },
  {
    id: 'livestock',
    index: '06',
    name: 'Livestock Information Mapping',
    description: 'Species populations, density and production output.',
    cardSlug: 'livestock-card',
    detailSlug: 'livestock-detail',
    cardAlt: 'A herd of ear-tagged cattle pressed close together',
    apps: [
      {
        name: 'Animal Resources Distribution Mapping',
        url: `${GEOHUB}/apps/dashboards/438e024e293142ca996a1e7ab3afa78c`,
        year: 'Year 1',
      },
    ],
    features: features.livestock,
  },
]

// Derived, never typed. The stats band counters read these.
export const totals = {
  modules: modules.length,
  apps: modules.reduce((n, m) => n + m.apps.length, 0),
  features: modules.reduce((n, m) => n + m.features.length, 0),
}

export const getModule = (id) => modules.find((m) => m.id === id)
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/data/modules.test.js`
Expected: PASS, 8 tests.

- [ ] **Step 5: Add the build guard `scripts/check-data.mjs`**

```js
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
```

- [ ] **Step 6: Run the guard**

Run: `node scripts/check-data.mjs`
Expected: `check-data ok: 6 modules, 6 applications, 44 features`

- [ ] **Step 7: Commit**

```bash
git add src/data/modules.js src/data/modules.test.js scripts/check-data.mjs
git commit -m "feat: add module data with integrity tests and a build guard"
```

---

### Task 4: Image pipeline

**Files:**
- Create: `scripts/prepare-images.py`
- Create: `src/config/image-manifest.js` (generated)
- Create: `src/config/images.js`
- Create: `public/images/*.webp` (generated)
- Test: `src/config/images.test.js`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `srcSet(slug)` from `src/config/images.js`, returning `{ src, srcSet, lqip }`. Throws `Error` on an unknown slug.
  - `heroSlugs` — `['hero-1', 'hero-2']`.
  - `heroAlt` — object keyed by hero slug.
  - `stripSlugs(module)` — the two slugs a module's detail-page photo strip shows: its `cardSlug`, then its `detailSlug` if it has one, otherwise `'hero-2'`.
  - `manifest` from `src/config/image-manifest.js` — `{ [slug]: number[] }`, widths ascending.

- [ ] **Step 1: Write `scripts/prepare-images.py`**

```python
"""Build the portal's WebP image set from the photographer's originals.

Run:  python3 scripts/prepare-images.py

Sources are 4-6k px and 2-6 MB each and must never be served directly. Each
slug is written at up to three widths plus a tiny blurred LQIP, and the
manifest records only the widths actually produced, so a source that cannot
fill 1920 does not advertise a file that was never written.
"""
import os

from PIL import Image, ImageFilter

SRC_DIR = "/home/treasure/Pictures/Screenshots"
OUT_DIR = "public/images"
MANIFEST = "src/config/image-manifest.js"
WIDTHS = [640, 1280, 1920]

# slug -> (source filename, crop box as fractions of (left, top, right, bottom))
#
# inputs-card is cropped down from the top: its flat grey sky is the one cool
# note in a warm palette, and losing most of it also strengthens the subject.
SOURCES = {
    "hero-1":              ("hero1.jpg",                (0, 0, 1, 1)),
    "hero-2":              ("hero2.jpg",                (0, 0, 1, 1)),
    "land-profiling-card": ("lan profiling2.jpg",       (0, 0.18, 1, 1)),
    "inputs-card":         ("agriculture inputs2.jpg",  (0, 0.22, 1, 1)),
    "inputs-detail":       ("agriculture inputs1.jpg",  (0, 0, 1, 1)),
    "crop-monitoring-card":("crop monitoring.jpg",      (0, 0, 1, 1)),
    "advisory-card":       ("farmer advisory.jpg",      (0, 0, 1, 1)),
    "value-chain-card":    ("land profiling.jpg",       (0, 0, 1, 1)),
    "livestock-card":      ("livestock1.jpg",           (0, 0, 1, 1)),
    "livestock-detail":    ("livestock2.jpg",           (0, 0, 1, 1)),
}

os.makedirs(OUT_DIR, exist_ok=True)
manifest = {}

for slug, (filename, box) in SOURCES.items():
    path = os.path.join(SRC_DIR, filename)
    if not os.path.exists(path):
        raise SystemExit(f"missing source image: {path}")

    im = Image.open(path).convert("RGB")
    w, h = im.size
    im = im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))

    written = []
    for width in WIDTHS:
        if im.width < width:
            continue
        scaled = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
        scaled.save(os.path.join(OUT_DIR, f"{slug}-{width}.webp"), "WEBP", quality=82, method=6)
        written.append(width)

    # Always emit the largest available width, even for a source narrower than
    # 640, so every slug has at least one real file behind it.
    if not written:
        im.save(os.path.join(OUT_DIR, f"{slug}-{im.width}.webp"), "WEBP", quality=82, method=6)
        written.append(im.width)

    lqip = im.resize((24, max(1, round(im.height * 24 / im.width))), Image.LANCZOS)
    lqip = lqip.filter(ImageFilter.GaussianBlur(1.2))
    lqip.save(os.path.join(OUT_DIR, f"{slug}-lqip.webp"), "WEBP", quality=40)

    manifest[slug] = written
    print(f"{slug:22} {written}")

with open(MANIFEST, "w") as f:
    f.write("// GENERATED by scripts/prepare-images.py - do not edit by hand.\n\n")
    f.write("export const manifest = {\n")
    for slug, widths in manifest.items():
        f.write(f"  '{slug}': [{', '.join(str(x) for x in widths)}],\n")
    f.write("}\n")

print(f"wrote {MANIFEST}: {len(manifest)} slugs")
```

- [ ] **Step 2: Run it**

Run: `mkdir -p src/config && python3 scripts/prepare-images.py`
Expected: 10 lines each ending `[640, 1280, 1920]`, then `wrote src/config/image-manifest.js: 10 slugs`.

If Pillow is missing: `pip3 install --user Pillow`

- [ ] **Step 3: Verify the output is actually small**

Run: `du -sh public/images && ls public/images | wc -l`
Expected: total well under 8 MB, and 40 files (10 slugs x 3 widths + 10 LQIP).

- [ ] **Step 4: Write the failing test**

`src/config/images.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { srcSet, heroSlugs, heroAlt, stripSlugs } from './images'
import { modules } from '../data/modules'

describe('images', () => {
  it('builds a srcSet from the manifest widths', () => {
    const { src, srcSet: set, lqip } = srcSet('hero-1')
    expect(src).toBe('/images/hero-1-1920.webp')
    expect(set).toContain('/images/hero-1-640.webp 640w')
    expect(set).toContain('/images/hero-1-1920.webp 1920w')
    expect(lqip).toBe('/images/hero-1-lqip.webp')
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
```

- [ ] **Step 5: Run it to verify it fails**

Run: `npx vitest run src/config/images.test.js`
Expected: FAIL — cannot resolve `./images`.

- [ ] **Step 6: Write `src/config/images.js`**

```js
// All portal imagery. To swap in different photographs, change the source
// filename in scripts/prepare-images.py and re-run it. Nothing here changes
// unless a slug is added or removed.
import { manifest } from './image-manifest.js'

const BASE = '/images'

export function srcSet(slug) {
  // The manifest lists only the widths actually written, so a source too small
  // for 1920 never advertises a file that does not exist.
  const widths = manifest[slug]
  if (!widths) throw new Error(`unknown image slug: ${slug}`)
  return {
    src: `${BASE}/${slug}-${widths[widths.length - 1]}.webp`,
    srcSet: widths.map((w) => `${BASE}/${slug}-${w}.webp ${w}w`).join(', '),
    lqip: `${BASE}/${slug}-lqip.webp`,
  }
}

// Hero Ken Burns rotation, in order. Cool emerald drifting to warm gold.
export const heroSlugs = ['hero-1', 'hero-2']

export const heroAlt = {
  'hero-1': 'Terraced hillside farmland above a misted valley',
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
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx vitest run src/config/images.test.js`
Expected: PASS, 5 tests.

- [ ] **Step 8: Commit**

```bash
git add scripts/prepare-images.py src/config public/images
git commit -m "feat: add WebP image pipeline with LQIP and generated manifest"
```

---

### Task 5: Access server

**Files:**
- Create: `server/access-server.js`
- Create: `server/vite-plugin.js`
- Create: `server/index.js`
- Create: `.env.example`
- Modify: `vite.config.js`
- Create: `src/lib/portal.js`
- Test: `src/lib/portal.test.js`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - HTTP endpoints `POST /api/auth/login` `{username, password}` -> `{authenticated, user}` or `{error}`; `GET /api/auth/session` -> `{authenticated, user?}`; `POST /api/auth/logout` -> `{authenticated:false}`.
  - Proxy bases `/api/portal/gh` (portal) and `/api/portal/srv` (ArcGIS Server).
  - `embedUrl(url)` and `PROXY_BASE` from `src/lib/portal.js`.
  - `createAccessMiddleware()` from `server/access-server.js`; `accessServerPlugin()` from `server/vite-plugin.js`.

- [ ] **Step 1: Port the access server**

```bash
mkdir -p server src/lib
cp /home/treasure/Documents/projects2/Natural-resource/server/access-server.js server/
cp /home/treasure/Documents/projects2/Natural-resource/server/vite-plugin.js server/
cp /home/treasure/Documents/projects2/Natural-resource/server/index.js server/
cp /home/treasure/Documents/projects2/Natural-resource/.env.example .env.example
```

- [ ] **Step 2: Rename the session cookie and the plugin**

In `server/access-server.js` change:
```js
const COOKIE = 'rsa_portal_session'
```
to:
```js
// Distinct from the environmental portal's cookie so the two can run side by
// side on localhost without evicting each other's session.
const COOKIE = 'rsa_agri_session'
```

In `server/vite-plugin.js` change `name: 'rsa-access-server'` to `name: 'rsa-agri-access-server'`.

Update the file header comment in `server/access-server.js` so it names this portal ("the RSA Agriculture and Livestock portal") rather than the environmental one. Leave every other comment in that file untouched — each one records a bug already paid for.

- [ ] **Step 3: Read `server/index.js` and fix its paths and ports**

Read the copied file. It serves `dist/` and mounts the middleware. Change any hardcoded port to `4174` and confirm the `dist` path resolves relative to the file, not the cwd. Change any user-facing string naming the environmental portal.

- [ ] **Step 4: Wire the plugin into `vite.config.js`**

Replace `vite.config.js` from Task 1 with:
```js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { accessServerPlugin } from './server/vite-plugin.js'

export default defineConfig(({ mode }) => {
  // Server-side config only. These are NEVER exposed to the browser: they are
  // read by the access server in-process, and carry no VITE_ prefix, so Vite
  // will not inline them into the client bundle.
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of [
    'PORTAL_URL',
    'PUBLIC_ORIGIN',
    'SESSION_SECRET',
    'PORTAL_CLIENT_ID',
    'PORTAL_CLIENT_SECRET',
  ]) {
    process.env[key] ||= env[key]
  }

  return {
    plugins: [react(), accessServerPlugin()],
    server: { port: 5174, strictPort: true },
    preview: { port: 4174 },
  }
})
```

- [ ] **Step 5: Update `.env.example` for this portal**

Change `PUBLIC_ORIGIN=https://localhost:4173` to `PUBLIC_ORIGIN=http://localhost:5174` and leave the rest, including the comment explaining that `PORTAL_CLIENT_ID`/`SECRET` select the OAuth password grant.

- [ ] **Step 6: Write the failing test for `embedUrl`**

`src/lib/portal.test.js`:
```js
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
```

- [ ] **Step 7: Run it to verify it fails**

Run: `npx vitest run src/lib/portal.test.js`
Expected: FAIL — cannot resolve `./portal`.

- [ ] **Step 8: Write `src/lib/portal.js`**

```js
/**
 * Turns a GeoHub application URL into one served through this portal's proxy.
 *
 * The applications cannot be framed directly: they are privately shared, so an
 * iframe pointed at gh.space.gov.rw has no way to authenticate — a cross-origin
 * frame is sealed to us. Routing through /api/portal/gh makes the frame
 * same-origin, and the server attaches the signed-in user's portal token.
 */
export const PORTAL_ORIGIN = 'https://gh.space.gov.rw/portal'
export const PROXY_BASE = '/api/portal/gh'

export function embedUrl(url) {
  if (typeof url !== 'string' || !url.startsWith(PORTAL_ORIGIN)) return url
  return PROXY_BASE + url.slice(PORTAL_ORIGIN.length)
}
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `npx vitest run src/lib/portal.test.js`
Expected: PASS, 4 tests.

- [ ] **Step 10: Verify the server answers**

Run `npm run dev` in one terminal, then:
```bash
curl -s http://localhost:5174/api/auth/session
```
Expected: `{"authenticated":false}`

- [ ] **Step 11: Commit**

```bash
git add server vite.config.js .env.example src/lib
git commit -m "feat: port the GeoHub access server and proxy URL helper"
```

---

### Task 6: Auth context and route protection

**Files:**
- Create: `src/auth/AuthContext.jsx`
- Create: `src/auth/ProtectedRoute.jsx`
- Test: `src/auth/ProtectedRoute.test.jsx`

**Interfaces:**
- Consumes: `/api/auth/*` from Task 5.
- Produces: `AuthProvider`, `useAuth()` returning `{ user, checking, signIn(username, password), signOut() }` where `signIn` resolves to `{ ok: true }` or `{ ok: false, error: string }`, and `user` is `{ username, fullName, email } | null`. `ProtectedRoute` as a wrapper component.

- [ ] **Step 1: Port the auth context**

```bash
mkdir -p src/auth
cp /home/treasure/Documents/projects2/Natural-resource/src/auth/AuthContext.jsx src/auth/
cp /home/treasure/Documents/projects2/Natural-resource/src/auth/ProtectedRoute.jsx src/auth/
```

Read both. `AuthContext.jsx` needs no changes — its interface is exactly the one above. Read `ProtectedRoute.jsx` and confirm it renders nothing while `checking` is true and redirects to `/signin` otherwise; adjust only if its redirect target differs.

- [ ] **Step 2: Write the failing test**

`src/auth/ProtectedRoute.test.jsx`:
```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import ProtectedRoute from './ProtectedRoute'

function renderAt(path) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/signin" element={<p>sign in please</p>} />
          <Route path="/" element={<ProtectedRoute><p>secret content</p></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => { vi.restoreAllMocks() })

  it('sends a signed-out visitor to the sign-in screen', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ authenticated: false }),
    }))
    renderAt('/')
    expect(await screen.findByText('sign in please')).toBeInTheDocument()
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
  })

  it('lets a signed-in user through', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ authenticated: true, user: { username: 'a', fullName: 'A Farmer', email: '' } }),
    }))
    renderAt('/')
    expect(await screen.findByText('secret content')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run it**

Run: `npx vitest run src/auth/ProtectedRoute.test.jsx`
Expected: PASS, 2 tests. If it fails because `ProtectedRoute` renders its children during `checking`, fix `ProtectedRoute.jsx` to return `null` while `checking` is true.

- [ ] **Step 4: Commit**

```bash
git add src/auth
git commit -m "feat: add GeoHub auth context and protected routes"
```

---

### Task 7: Presentation primitives

**Files:**
- Create: `src/components/Photo.jsx`
- Create: `src/components/Reveal.jsx`
- Create: `src/components/Counter.jsx`
- Test: `src/components/Counter.test.jsx`

**Interfaces:**
- Consumes: `srcSet` from Task 4.
- Produces:
  - `<Photo slug alt sizes className />` — LQIP behind, real image cross-fading in.
  - `<Reveal delay={0} className>` — children rise and fade on `whileInView`, once.
  - `<Counter to={6} duration={1.4} />` — renders `0` then counts to `to`; renders `to` immediately under reduced motion.

- [ ] **Step 1: Write `src/components/Photo.jsx`**

```jsx
import { useState } from 'react'
import { srcSet } from '../config/images'

export default function Photo({ slug, alt, sizes = '100vw', className = '' }) {
  const { src, srcSet: set, lqip } = srcSet(slug)
  const [loaded, setLoaded] = useState(false)

  return (
    <span className={`block overflow-hidden bg-band ${className}`}>
      <span className="relative block h-full w-full">
        <img
          src={lqip}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
        />
        <img
          src={src}
          srcSet={set}
          sizes={sizes}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`relative h-full w-full object-cover transition-opacity duration-700
                      ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </span>
    </span>
  )
}
```

- [ ] **Step 2: Write `src/components/Reveal.jsx`**

```jsx
import { motion, useReducedMotion } from 'framer-motion'

export default function Reveal({ children, delay = 0, className = '' }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 3: Write the failing Counter test**

`src/components/Counter.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Counter from './Counter'

describe('Counter', () => {
  it('counts up to its target', async () => {
    render(<Counter to={44} duration={0.1} />)
    await waitFor(() => expect(screen.getByText('44')).toBeInTheDocument())
  })

  it('never overshoots the target', async () => {
    render(<Counter to={6} duration={0.1} />)
    await waitFor(() => expect(screen.getByText('6')).toBeInTheDocument())
    await new Promise((r) => setTimeout(r, 60))
    expect(Number(screen.getByRole('status').textContent)).toBe(6)
  })
})
```

- [ ] **Step 4: Run it to verify it fails**

Run: `npx vitest run src/components/Counter.test.jsx`
Expected: FAIL — cannot resolve `./Counter`.

- [ ] **Step 5: Write `src/components/Counter.jsx`**

```jsx
import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

/**
 * Counts from zero to `to` once the element is in view.
 *
 * Driven by requestAnimationFrame against a wall-clock start rather than by
 * incrementing per frame: a per-frame increment drifts with frame rate and can
 * overshoot on a slow tick, which looks like a bug on a statistics band.
 */
export default function Counter({ to, duration = 1.4, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduced = useReducedMotion()
  const [value, setValue] = useState(reduced ? to : 0)

  useEffect(() => {
    if (reduced || !inView) return
    let frame
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      // Ease-out cubic, so the number settles rather than stopping dead.
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, reduced, to, duration])

  return (
    <span ref={ref} role="status" className={`tabular ${className}`}>{value}</span>
  )
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run src/components/Counter.test.jsx`
Expected: PASS, 2 tests.

- [ ] **Step 7: Commit**

```bash
git add src/components
git commit -m "feat: add Photo, Reveal and Counter primitives"
```

---

### Task 8: App shell, navigation and sign-in

**Files:**
- Create: `src/App.jsx`, `src/components/Nav.jsx`, `src/components/Footer.jsx`, `src/components/ScrollToTop.jsx`
- Create: `src/views/SignInView.jsx`
- Test: `src/views/SignInView.test.jsx`

**Interfaces:**
- Consumes: `useAuth` (Task 6), `Photo` (Task 7), `modules`/`totals` (Task 3).
- Produces: routes `/signin`, `/`, `/module/:id`, `/module/:id/app/:appIndex`. `<Nav />` accepts no props and reads auth itself.

- [ ] **Step 1: Write `src/components/ScrollToTop.jsx`**

```jsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
```

- [ ] **Step 2: Write `src/App.jsx`**

```jsx
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import SignInView from './views/SignInView'
import PortalView from './views/PortalView'
import ModuleView from './views/ModuleView'
import AppViewer from './views/AppViewer'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/signin" element={<SignInView />} />
        <Route path="/" element={<ProtectedRoute><PortalView /></ProtectedRoute>} />
        <Route path="/module/:id" element={<ProtectedRoute><ModuleView /></ProtectedRoute>} />
        <Route path="/module/:id/app/:appIndex" element={<ProtectedRoute><AppViewer /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <a
          href="#content"
          onClick={(e) => {
            // Under HashRouter the fragment IS the route, so letting this anchor
            // navigate would set the path to /content, match no route, and render
            // a blank page. Move focus manually instead.
            e.preventDefault()
            const el = document.getElementById('content')
            if (el) {
              el.setAttribute('tabindex', '-1')
              el.focus()
              el.scrollIntoView()
            }
          }}
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4
                     focus:z-50 focus:bg-surface focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <AnimatedRoutes />
      </HashRouter>
    </AuthProvider>
  )
}
```

- [ ] **Step 3: Write `src/components/Nav.jsx`**

Transparent over the hero, solid bone with a hairline border after 24px of scroll. Wordmark in Fraunces on the left, signed-in name and Sign out on the right, both Inter Tight at 13px. No gold — the hero's scroll cue owns gold on that view.

```jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Nav({ overHero = false }) {
  const { user, signOut } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const solid = scrolled || !overHero

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ease-editorial
                  ${solid ? 'border-b border-hairline bg-bone' : 'border-b border-transparent bg-transparent'}`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-10">
        <Link to="/" className={`font-display text-lg tracking-tight ${solid ? 'text-soil' : 'text-onDark'}`}>
          Agriculture <span className="italic">&amp;</span> Livestock
        </Link>
        <div className={`flex items-center gap-6 text-[13px] ${solid ? 'text-muted' : 'text-onDark/80'}`}>
          {user && <span className="hidden sm:inline">{user.fullName || user.username}</span>}
          {user && (
            <button
              type="button"
              onClick={signOut}
              className={`border-b pb-0.5 transition-colors ${solid ? 'border-hairline hover:border-soil hover:text-soil' : 'border-onDark/40 hover:border-onDark hover:text-onDark'}`}
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Write `src/components/Footer.jsx`**

```jsx
import { totals } from '../data/modules'

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-bone">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10">
        <p className="max-w-xl font-display text-2xl leading-tight text-soil md:text-3xl">
          Rwanda Space Agency — National Geoportal
        </p>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
          {totals.modules} modules, {totals.apps} live applications and {totals.features} mapped
          capabilities for the agriculture and livestock sector.
        </p>
        <p className="mt-10 text-[13px] text-muted">
          Applications are served from the GeoHub portal at gh.space.gov.rw.
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 5: Write the failing sign-in test**

`src/views/SignInView.test.jsx`:
```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import SignInView from './SignInView'

const renderView = () =>
  render(
    <AuthProvider>
      <MemoryRouter><SignInView /></MemoryRouter>
    </AuthProvider>,
  )

describe('SignInView', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ authenticated: false }),
    }))
  })

  it('asks for a GeoHub username and password', async () => {
    renderView()
    expect(await screen.findByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('shows the error the portal returned', async () => {
    renderView()
    await screen.findByLabelText(/username/i)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, json: async () => ({ error: 'Too many invalid logins.' }),
    }))
    await userEvent.type(screen.getByLabelText(/username/i), 'someone')
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText('Too many invalid logins.')).toBeInTheDocument()
  })

  it('offers ArcGIS Enterprise as a not-yet-available option', async () => {
    renderView()
    const btn = await screen.findByRole('button', { name: /arcgis enterprise/i })
    expect(btn).toBeDisabled()
  })
})
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npx vitest run src/views/SignInView.test.jsx`
Expected: FAIL — cannot resolve `./SignInView`.

- [ ] **Step 7: Write `src/views/SignInView.jsx`**

Split layout: `advisory-card` full-bleed on the left at `md:` and up, form on bone at the right. Labels are real `<label htmlFor>`. Gold's single role on this view is the submit button's underline.

```jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Photo from '../components/Photo'
import { useAuth } from '../auth/AuthContext'

export default function SignInView() {
  const { user, checking, signIn } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (user) navigate('/', { replace: true }) }, [user, navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const result = await signIn(username, password)
    setBusy(false)
    if (!result.ok) setError(result.error)
  }

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <Photo
        slug="advisory-card"
        alt="A farmer pouring harvested grain between her hands"
        sizes="(min-width: 768px) 50vw, 100vw"
        className="hidden h-full md:block"
      />
      <div className="flex items-center justify-center px-6 py-20 md:px-16">
        <div className="w-full max-w-sm">
          <p className="font-display text-4xl leading-[0.95] tracking-tight text-soil md:text-5xl">
            Agriculture <span className="italic">and</span> Livestock
          </p>
          <p className="mt-5 text-[15px] leading-relaxed text-muted">
            Sign in with your GeoHub account to reach the national agriculture
            and livestock mapping applications.
          </p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <div>
              <label htmlFor="username" className="block text-[13px] text-muted">Username</label>
              <input
                id="username" name="username" autoComplete="username" required
                value={username} onChange={(e) => setUsername(e.target.value)}
                className="mt-2 w-full border-b border-hairline bg-transparent pb-2
                           text-[15px] text-soil transition-colors focus:border-soil"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[13px] text-muted">Password</label>
              <input
                id="password" name="password" type="password" autoComplete="current-password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full border-b border-hairline bg-transparent pb-2
                           text-[15px] text-soil transition-colors focus:border-soil"
              />
            </div>

            {error && <p role="alert" className="text-[13px] text-clay">{error}</p>}

            <button
              type="submit" disabled={busy || checking}
              className="mt-2 border-b-2 border-gold pb-1 font-display text-xl text-soil
                         transition-opacity disabled:opacity-50"
            >
              {busy ? 'Signing in' : 'Sign in'}
            </button>
          </form>

          {/* TODO: ArcGIS Enterprise OAuth 2.0 plugs in here. The server already
              prefers the OAuth password grant when PORTAL_CLIENT_ID and
              PORTAL_CLIENT_SECRET are set (see generatePortalToken in
              server/access-server.js). A full authorization-code flow would
              redirect to ${PORTAL_URL}/sharing/rest/oauth2/authorize with this
              portal's client_id and redirect_uri, then exchange the returned
              code at /sharing/rest/oauth2/token from the server and set the
              same session cookie signIn already sets. */}
          <button
            type="button" disabled
            title="Available once this portal is registered as an application on GeoHub"
            className="mt-10 w-full border border-hairline py-3 text-[14px] text-muted
                       disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continue with ArcGIS Enterprise
          </button>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npx vitest run src/views/SignInView.test.jsx`
Expected: PASS, 3 tests. The view imports `PortalView`, `ModuleView` and `AppViewer` only through `App.jsx`, so this test passes before Task 9 exists.

- [ ] **Step 9: Commit**

```bash
git add src/App.jsx src/components src/views
git commit -m "feat: add app shell, navigation, footer and GeoHub sign-in"
```

---

### Task 9: Portal view

**Files:**
- Create: `src/views/PortalView.jsx`
- Create: `src/components/Hero.jsx`, `src/components/StatsBand.jsx`, `src/components/ModuleCard.jsx`, `src/components/FeatureBand.jsx`
- Test: `src/views/PortalView.test.jsx`

**Interfaces:**
- Consumes: `modules`, `totals` (Task 3); `heroSlugs`, `heroAlt` (Task 4); `Photo`, `Reveal`, `Counter` (Task 7); `Nav`, `Footer` (Task 8).
- Produces: the `/` view. `<ModuleCard module={module} i={index} />`, `<FeatureBand module={module} flipped={boolean} />`.

- [ ] **Step 1: Write `src/components/Hero.jsx`**

Two-frame Ken Burns cross-fade, warm scrim, headline words rising in sequence, gold scroll cue. Gold's single role on this view is the scroll cue.

```jsx
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { srcSet, heroSlugs, heroAlt } from '../config/images'

const WORDS = ['Agriculture', 'and', 'Livestock', 'Management']

export default function Hero() {
  const reduced = useReducedMotion()
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setFrame((f) => (f + 1) % heroSlugs.length), 9000)
    return () => clearInterval(id)
  }, [reduced])

  return (
    <section className="relative h-[92vh] min-h-[520px] w-full overflow-hidden bg-soil">
      {heroSlugs.map((slug, i) => {
        const { src, srcSet: set, lqip } = srcSet(slug)
        return (
          <motion.img
            key={slug}
            src={src} srcSet={set} sizes="100vw" alt={i === 0 ? heroAlt[slug] : ''}
            aria-hidden={i !== 0}
            style={{ backgroundImage: `url(${lqip})`, backgroundSize: 'cover' }}
            className="absolute inset-0 h-full w-full object-cover"
            initial={false}
            animate={
              reduced
                ? { opacity: i === 0 ? 1 : 0 }
                : { opacity: frame === i ? 1 : 0, scale: frame === i ? 1.08 : 1 }
            }
            transition={{ opacity: { duration: 2 }, scale: { duration: 11, ease: 'linear' } }}
          />
        )
      })}

      {/* Functional scrim: the headline sits on photography and must stay legible. */}
      <div className="absolute inset-0 bg-gradient-to-t from-soil/85 via-soil/35 to-soil/20" />

      <div className="relative mx-auto flex h-full max-w-[1400px] flex-col justify-end px-6 pb-20 md:px-10 md:pb-28">
        <h1 className="font-display text-onDark" style={{ lineHeight: 0.92, letterSpacing: '-0.03em' }}>
          {WORDS.map((word, i) => (
            <span key={word} className="block overflow-hidden">
              <motion.span
                className="block text-[clamp(3rem,9vw,8rem)]"
                initial={reduced ? false : { y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.11, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>
        <p className="mt-8 max-w-md text-[15px] leading-relaxed text-onDark/75">
          Rwanda&apos;s national geoportal for the agriculture and livestock sector —
          from parcel-level soil to export supply chains.
        </p>
        <span className="mt-10 inline-block w-fit border-b-2 border-gold pb-1 text-[13px] text-onDark/80">
          Scroll
        </span>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Write `src/components/StatsBand.jsx`**

No gold here — the numerals are soil, and their size carries them.

```jsx
import Counter from './Counter'
import Reveal from './Reveal'
import { totals } from '../data/modules'

const STATS = [
  { to: totals.modules, label: 'Modules' },
  { to: totals.apps, label: 'Live applications' },
  { to: totals.features, label: 'Mapped capabilities' },
]

export default function StatsBand() {
  return (
    <section className="border-y border-hairline bg-band">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-6 py-20 sm:grid-cols-3 md:px-10">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.1}>
            <p className="font-display text-[clamp(3.5rem,7vw,6rem)] leading-none text-soil">
              <Counter to={stat.to} />
            </p>
            <p className="mt-4 text-[14px] text-muted">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Write `src/components/ModuleCard.jsx`**

Gold's single role on the portal grid: the rule that draws left to right under the title on hover. The image scales inside a fixed frame. Farmer Advisory's zero applications reads as a capability count, not an empty one.

```jsx
import { Link } from 'react-router-dom'
import Photo from './Photo'
import Reveal from './Reveal'

function meta(module) {
  // A module with no application yet is described by what it covers, not by a
  // zero. Farmer Advisory is the only such module in this delivery.
  if (module.apps.length === 0) return `${module.features.length} capabilities`
  return module.apps.length === 1 ? '1 application' : `${module.apps.length} applications`
}

export default function ModuleCard({ module, i = 0 }) {
  return (
    <Reveal delay={(i % 3) * 0.08}>
      <Link to={`/module/${module.id}`} className="group block">
        <span className="block aspect-[4/3] overflow-hidden">
          <Photo
            slug={module.cardSlug}
            alt={module.cardAlt}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="h-full w-full transition-transform duration-[900ms] ease-editorial
                       group-hover:scale-[1.04]"
          />
        </span>

        <span className="mt-5 flex items-baseline gap-3">
          <span className="tabular text-[13px] text-muted">{module.index}</span>
          <span className="font-display text-[clamp(1.35rem,2vw,1.75rem)] leading-tight text-soil">
            {module.name}
          </span>
        </span>

        <span className="mt-3 block h-px w-full bg-hairline">
          <span
            className="block h-px w-0 bg-gold transition-[width] duration-700 ease-editorial
                       group-hover:w-full group-focus-visible:w-full"
          />
        </span>

        <span className="mt-3 flex items-baseline justify-between gap-4">
          <span className="text-[14px] leading-relaxed text-muted">{module.description}</span>
          <span className="shrink-0 text-[13px] text-muted">{meta(module)}</span>
        </span>
      </Link>
    </Reveal>
  )
}
```

- [ ] **Step 4: Write `src/components/FeatureBand.jsx`**

Alternating full-width band, image parallaxing as it scrolls, sides flipping per module. No gold.

```jsx
import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import Photo from './Photo'
import Reveal from './Reveal'

export default function FeatureBand({ module, flipped = false }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-6%', '6%'])

  return (
    <section
      ref={ref}
      className={`border-b border-hairline ${flipped ? 'bg-band' : 'bg-bone'}`}
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-2 md:gap-20 md:px-10">
        <div className={`overflow-hidden ${flipped ? 'md:order-2' : ''}`}>
          <motion.div style={{ y }} className="aspect-[5/4]">
            <Photo
              slug={module.cardSlug}
              alt={module.cardAlt}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="h-full w-full scale-110"
            />
          </motion.div>
        </div>

        <div className={flipped ? 'md:order-1' : ''}>
          <Reveal>
            <p className="tabular text-[13px] text-muted">{module.index}</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] tracking-tight text-soil">
              {module.name}
            </h2>
            <ul className="mt-8 space-y-3">
              {module.features.map((feature) => (
                <li
                  key={feature}
                  className="border-t border-hairline pt-3 text-[15px] leading-relaxed text-muted"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Write the failing PortalView test**

`src/views/PortalView.test.jsx`:
```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import PortalView from './PortalView'
import { modules } from '../data/modules'

const renderView = () =>
  render(
    <AuthProvider>
      <MemoryRouter><PortalView /></MemoryRouter>
    </AuthProvider>,
  )

describe('PortalView', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ authenticated: true, user: { username: 'a', fullName: 'A Farmer', email: '' } }),
    }))
    window.scrollTo = vi.fn()
  })

  it('links to every module', async () => {
    renderView()
    for (const m of modules) {
      const links = await screen.findAllByRole('link', { name: new RegExp(m.name, 'i') })
      expect(links.length).toBeGreaterThan(0)
      expect(links[0]).toHaveAttribute('href', `/module/${m.id}`)
    }
  })

  it('describes Farmer Advisory by its capabilities, not a zero application count', async () => {
    renderView()
    expect(await screen.findByText('8 capabilities')).toBeInTheDocument()
    expect(screen.queryByText('0 applications')).not.toBeInTheDocument()
  })

  it('lists every feature from the spreadsheet somewhere on the page', async () => {
    renderView()
    const first = modules[0].features[0]
    expect(await screen.findByText(first)).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npx vitest run src/views/PortalView.test.jsx`
Expected: FAIL — cannot resolve `./PortalView`.

- [ ] **Step 7: Write `src/views/PortalView.jsx`**

```jsx
import { motion } from 'framer-motion'
import Nav from '../components/Nav'
import Hero from '../components/Hero'
import StatsBand from '../components/StatsBand'
import ModuleCard from '../components/ModuleCard'
import FeatureBand from '../components/FeatureBand'
import Footer from '../components/Footer'
import Reveal from '../components/Reveal'
import { modules } from '../data/modules'

export default function PortalView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Nav overHero />
      <Hero />
      <main id="content">
        <StatsBand />

        <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-10">
          <Reveal>
            <h2 className="max-w-2xl font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] tracking-tight text-soil">
              Six modules, from parcel-level soil to export supply chains
            </h2>
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, i) => (
              <ModuleCard key={module.id} module={module} i={i} />
            ))}
          </div>
        </section>

        {modules.map((module, i) => (
          <FeatureBand key={module.id} module={module} flipped={i % 2 === 1} />
        ))}
      </main>
      <Footer />
    </motion.div>
  )
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npx vitest run src/views/PortalView.test.jsx`
Expected: PASS, 3 tests.

- [ ] **Step 9: Commit**

```bash
git add src/views/PortalView.jsx src/views/PortalView.test.jsx src/components
git commit -m "feat: add portal view with hero, stats, module grid and feature bands"
```

---

### Task 10: Module detail and application viewer

**Files:**
- Create: `src/views/ModuleView.jsx`, `src/views/AppViewer.jsx`, `src/components/AppCard.jsx`
- Test: `src/views/ModuleView.test.jsx`

**Interfaces:**
- Consumes: `getModule` (Task 3), `stripSlugs` (Task 4), `embedUrl` (Task 5), `Photo`/`Reveal` (Task 7), `Nav`/`Footer` (Task 8).
- Produces: the `/module/:id` and `/module/:id/app/:appIndex` views.

- [ ] **Step 1: Write `src/components/AppCard.jsx`**

Gold's single role on the module page: the Open control.

```jsx
import { Link } from 'react-router-dom'

export default function AppCard({ module, app, index }) {
  return (
    <li className="border-t border-hairline py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-6">
        <div className="max-w-xl">
          <h3 className="font-display text-[clamp(1.35rem,2.2vw,1.9rem)] leading-tight text-soil">
            {app.name}
          </h3>
          <p className="mt-2 tabular text-[13px] text-muted">{app.year}</p>
        </div>
        <Link
          to={`/module/${module.id}/app/${index}`}
          className="border-b-2 border-gold pb-1 font-display text-lg text-soil"
        >
          Open
        </Link>
      </div>
    </li>
  )
}
```

- [ ] **Step 2: Write the failing ModuleView test**

`src/views/ModuleView.test.jsx`:
```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import ModuleView from './ModuleView'
import { getModule } from '../data/modules'

function renderAt(id) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/module/${id}`]}>
        <Routes><Route path="/module/:id" element={<ModuleView />} /></Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('ModuleView', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ authenticated: true, user: { username: 'a', fullName: 'A', email: '' } }),
    }))
    window.scrollTo = vi.fn()
  })

  it('lists a module’s applications with an Open control each', async () => {
    renderAt('land-profiling')
    const mod = getModule('land-profiling')
    for (const app of mod.apps) {
      expect(await screen.findByText(app.name)).toBeInTheDocument()
    }
    expect(screen.getAllByRole('link', { name: 'Open' })).toHaveLength(2)
  })

  it('lists every feature of the module', async () => {
    renderAt('livestock')
    const mod = getModule('livestock')
    for (const feature of mod.features) {
      expect(await screen.findByText(feature)).toBeInTheDocument()
    }
  })

  it('explains Farmer Advisory rather than showing an empty application list', async () => {
    renderAt('advisory')
    expect(await screen.findByText(/later phase/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Open' })).not.toBeInTheDocument()
  })

  it('shows a not-found message for an unknown module', async () => {
    renderAt('nope')
    expect(await screen.findByText(/not found/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run src/views/ModuleView.test.jsx`
Expected: FAIL — cannot resolve `./ModuleView`.

- [ ] **Step 4: Write `src/views/ModuleView.jsx`**

```jsx
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import Photo from '../components/Photo'
import Reveal from '../components/Reveal'
import AppCard from '../components/AppCard'
import { getModule } from '../data/modules'
import { stripSlugs } from '../config/images'

export default function ModuleView() {
  const { id } = useParams()
  const module = getModule(id)

  if (!module) {
    return (
      <div>
        <Nav />
        <main id="content" className="mx-auto max-w-[1400px] px-6 py-40 md:px-10">
          <h1 className="font-display text-4xl text-soil">Module not found</h1>
          <Link to="/" className="mt-6 inline-block border-b border-hairline pb-1 text-[15px] text-muted">
            Back to the portal
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Nav />
      <main id="content" className="pt-24">
        <header className="mx-auto max-w-[1400px] px-6 py-16 md:px-10">
          <Link to="/" className="text-[13px] text-muted transition-colors hover:text-soil">
            Portal
          </Link>
          <p className="tabular mt-10 text-[13px] text-muted">{module.index}</p>
          <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] tracking-tight text-soil">
            {module.name}
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-muted">{module.description}</p>
        </header>

        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-6 md:grid-cols-2 md:px-10">
          {stripSlugs(module).map((slug, i) => (
            <Reveal key={slug} delay={i * 0.1}>
              <span className="block aspect-[3/2]">
                <Photo
                  slug={slug}
                  alt={i === 0 ? module.cardAlt : ''}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="h-full w-full"
                />
              </span>
            </Reveal>
          ))}
        </div>

        <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-10">
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-tight text-soil">
            Applications
          </h2>
          {module.apps.length > 0 ? (
            <ul className="mt-10">
              {module.apps.map((app, i) => (
                <AppCard key={app.url} module={module} app={app} index={i} />
              ))}
            </ul>
          ) : (
            <p className="mt-8 max-w-xl border-t border-hairline pt-8 text-[15px] leading-relaxed text-muted">
              The advisory application is scheduled for a later phase. The capabilities
              below describe what it will cover.
            </p>
          )}
        </section>

        <section className="border-t border-hairline bg-band">
          <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10">
            <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-tight text-soil">
              Capabilities
            </h2>
            <ul className="mt-10 grid grid-cols-1 gap-x-14 md:grid-cols-2">
              {module.features.map((feature, i) => (
                <li key={feature} className="border-t border-hairline py-5">
                  <span className="tabular mr-4 text-[13px] text-muted">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[15px] leading-relaxed text-muted">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </motion.div>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/views/ModuleView.test.jsx`
Expected: PASS, 4 tests.

- [ ] **Step 6: Write `src/views/AppViewer.jsx`**

```jsx
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getModule } from '../data/modules'
import { embedUrl } from '../lib/portal'

export default function AppViewer() {
  const { id, appIndex } = useParams()
  const { user } = useAuth()
  const module = getModule(id)
  const app = module?.apps[Number(appIndex)]

  if (!app) {
    return (
      <main className="mx-auto max-w-[1400px] px-6 py-40 md:px-10">
        <h1 className="font-display text-4xl text-soil">Application not found</h1>
        <Link to="/" className="mt-6 inline-block border-b border-hairline pb-1 text-[15px] text-muted">
          Back to the portal
        </Link>
      </main>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-bone">
      <header className="flex shrink-0 flex-wrap items-baseline justify-between gap-4
                         border-b border-hairline px-6 py-4 md:px-10">
        <div className="flex flex-wrap items-baseline gap-4">
          <Link to={`/module/${module.id}`} className="text-[13px] text-muted transition-colors hover:text-soil">
            {module.name}
          </Link>
          <h1 className="font-display text-lg leading-tight text-soil">{app.name}</h1>
        </div>
        {user && <span className="text-[13px] text-muted">{user.fullName || user.username}</span>}
      </header>

      {/*
        The src goes through the proxy, never straight to gh.space.gov.rw. The
        applications are privately shared, so a cross-origin frame could not
        authenticate; same-origin lets the server attach the session's token.
      */}
      <iframe
        title={app.name}
        src={embedUrl(app.url)}
        className="min-h-0 w-full flex-1 border-0"
        allow="geolocation; fullscreen"
      />
    </div>
  )
}
```

- [ ] **Step 7: Run the whole suite**

Run: `npx vitest run`
Expected: PASS across all files — modules, images, portal, ProtectedRoute, Counter, SignInView, PortalView, ModuleView.

- [ ] **Step 8: Commit**

```bash
git add src/views src/components/AppCard.jsx
git commit -m "feat: add module detail page and proxied application viewer"
```

---

### Task 11: Production build and manual verification

**Files:**
- Create: `README.md`
- Modify: `package.json` (only if a script is missing)

**Interfaces:**
- Consumes: everything above.
- Produces: a `dist/` build and a README documenting setup, the two generators, and the environment variables.

- [ ] **Step 1: Create a real session secret and env file**

```bash
cp .env.example .env
printf 'SESSION_SECRET=%s\n' "$(openssl rand -base64 32)" >> .env
```

- [ ] **Step 2: Run the full test suite and the data guard**

Run: `npx vitest run && node scripts/check-data.mjs`
Expected: all tests PASS, then `check-data ok: 6 modules, 6 applications, 44 features`.

- [ ] **Step 3: Produce the production build**

Run: `npm run build`
Expected: the guard prints its ok line, then Vite writes `dist/`. No warning about a chunk over 1 MB; if one appears, note the size but do not restructure — Framer Motion and React account for it.

- [ ] **Step 4: Check what the build actually weighs**

Run: `du -sh dist && du -sh dist/images 2>/dev/null; ls -la dist/assets | head`
Expected: images dominate and the JS bundle is a few hundred KB. If any single image exceeds 400 KB, lower the `quality` in `prepare-images.py` and re-run it.

- [ ] **Step 5: Verify in a browser**

Run `npm run dev`, open `http://localhost:5174`, and confirm each of these by eye:

1. `/#/` redirects to `/#/signin` when signed out.
2. Signing in with real GeoHub credentials lands on the portal; a wrong password shows the portal's own message.
3. Hero: two frames cross-fade, words rise in sequence on load, the scroll cue is the only gold on screen.
4. Nav is transparent over the hero and becomes solid bone with a hairline after scrolling.
5. Counters reach 6, 6 and 44.
6. Module cards: image scales inside a fixed frame on hover and the gold rule draws left to right.
7. Farmer Advisory's card reads `8 capabilities`.
8. Feature bands alternate sides and the images parallax.
9. A module page opens, and Open loads the dashboard inside the portal without a second ArcGIS login.
10. Sign out returns to the sign-in screen.
11. At 375px wide nothing overflows horizontally.
12. Tab through the page: focus is visible on every interactive element.
13. With `prefers-reduced-motion: reduce` set in DevTools' Rendering panel and the page reloaded, the hero holds one frame, counters show final values immediately, and nothing parallaxes.

- [ ] **Step 6: Write `README.md`**

Cover: what the portal is; `npm install`, `npm run dev`, `npm run build`, `npm start`; the two generators and when to re-run them (`extract-features.py` when the workbook changes, `prepare-images.py` when a photograph changes); the environment variables and that they are server-side only; why the proxy exists in one paragraph; and that ports are 5174/4174 to coexist with the environmental portal.

- [ ] **Step 7: Commit**

```bash
git add README.md .env.example package.json
git commit -m "docs: add README covering setup, generators and the proxy"
```

---

## Self-review notes

- Spec coverage: decisions table (Tasks 5, 9, 10), data (2, 3), images (4), palette and type (1), screens (8, 9, 10), motion and accessibility (7, 9, 11 step 5), server (5), testing (3, 4, 5, 6, 7, 8, 9, 10), out-of-scope respected throughout.
- Names used consistently: `srcSet`, `stripSlugs`, `embedUrl`, `getModule`, `totals`, `cardSlug`, `detailSlug`, `heroSlugs`, `heroAlt`, `manifest`, `createAccessMiddleware`, `accessServerPlugin`.
- Gold appears exactly once per view: hero scroll cue, module-card hover rule, sign-in submit underline, AppCard Open. StatsBand, FeatureBand, Nav and Footer carry none.
