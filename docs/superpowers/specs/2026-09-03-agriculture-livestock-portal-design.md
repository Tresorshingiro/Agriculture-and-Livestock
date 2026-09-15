# Agriculture and Livestock Management Application — Design

Rwanda Space Agency / National Geoportal. A launcher: users sign in once against
GeoHub, browse 6 modules, and open ArcGIS applications inside the portal.

Sibling to `Natural-resource`, which supplies the proven server, image pipeline
and data-generation patterns. The visual language is deliberately opposite:
that portal is dark and technical, this one is light and editorial.

## Decisions

| Question | Decision |
|---|---|
| Auth | Real GeoHub auth, server-brokered. Not front-end only. |
| Apps open | In-portal proxied viewer. Not a new tab. |
| Scope | Year 1 and Year 2 applications only. The 3 Year-3 apps are dropped. |
| Images | WebP pipeline: 640/1280/1920 + LQIP, generated. |

Rationale for the first two: the dashboards are privately shared, so a
cross-origin iframe cannot authenticate and a new tab triggers ArcGIS Identity
Manager's own login. Proxying is the only way one sign-in covers everything.

## Stack

React 19, Vite 8, Tailwind 3, Framer Motion 13, react-router HashRouter, Vitest.
A Node access server mounts as Vite middleware in dev and preview, and in front
of `dist/` in production, so `/api/*` exists in every environment.

```
scripts/        extract-features.py · prepare-images.py · check-data.mjs
server/         access-server.js · vite-plugin.js · index.js
src/data/       modules.js · features.generated.js
src/config/     images.js · image-manifest.js
src/auth/       AuthContext.jsx · ProtectedRoute.jsx
src/views/      SignInView · PortalView · ModuleView · AppViewer
src/components/ Nav · Hero · StatsBand · ModuleCard · FeatureBand · AppCard
                Counter · Reveal · Photo · Footer · Logo · ScrollToTop
source-data/    2nd_year_EA_Applications_1.xlsx
```

Routes: `/signin` · `/` · `/module/:id` · `/module/:id/app/:appIndex`

## Data

`scripts/extract-features.py` reads the workbook, keeps rows where
`Proposed Application = "Agriculture and Livestock Management Application"`,
strips leading `N.\t` numbering, and writes `src/data/features.generated.js`.
It asserts 6 modules and 44 features; a mismatch fails the build.

`src/data/modules.js` holds only what the sheet does not: id, index, name,
description, image slugs, alt text, and the application list. It imports the
features and derives `totals`. Nothing is hardcoded inside a component.

| # | id | Module | Apps | Features |
|---|---|---|---|---|
| 01 | `land-profiling` | Agricultural Land Profiling | 2 | 8 |
| 02 | `inputs` | Agriculture Inputs Management | 1 | 7 |
| 03 | `crop-monitoring` | Crop Monitoring and Forecasting | 1 | 7 |
| 04 | `advisory` | Farmer Advisory | 0 | 8 |
| 05 | `value-chain` | Agricultural Value Chain Mapping | 1 | 7 |
| 06 | `livestock` | Livestock Information Mapping | 1 | 7 |

Totals: **6 modules · 6 applications · 44 features**.

Application URLs, all under `https://gh.space.gov.rw/portal`:

- `land-profiling` — `/apps/dashboards/bb2735551a6648a1ba5ede6655b1212c` (Soil Information Mapping, Year 1)
- `land-profiling` — `/apps/dashboards/b25b3af776574dc8a7f521af5e0f3487` (Land Profiling and Crops Suitability, Year 1)
- `inputs` — `/apps/experiencebuilder/experience/?id=7c6fcc2f06104a07a5e20043c5c16536` (Year 2)
- `crop-monitoring` — `/apps/experiencebuilder/experience/?id=09c89ab217e54c829b691069c2049b79` (Year 2)
- `value-chain` — `/apps/knowledge-studio/main?id=06b93d69b902438e9f70c2cbc8e676b3` (Year 2)
- `livestock` — `/apps/dashboards/438e024e293142ca996a1e7ab3afa78c` (Year 1)

### Farmer Advisory has no applications

This is a real state, not an error. Its card shows `8 capabilities` where others
show an application count. Its module page renders the photo strip and feature
list, with a plain line stating applications arrive in a later phase. No empty
list, no disabled button, no "coming soon" badge.

## Images

Sources in `/home/treasure/Pictures/Screenshots`, 4–6k px and 2–6 MB, so they
must be processed. `scripts/prepare-images.py` writes 640/1280/1920 WebP plus a
blurred LQIP into `/public/images`, and generates `src/config/image-manifest.js`
listing only the widths actually written. `Photo.jsx` renders the LQIP behind
the real image and cross-fades on load.

| Slug | Source | Role |
|---|---|---|
| `hero-1` | `hero1.jpg` | Hero frame 1 — terraced hillside, cool emerald |
| `hero-2` | `hero2.jpg` | Hero frame 2 — terraced paddies, warm gold |
| `land-profiling-card` | `lan profiling2.jpg` | Rows, bare soil, parcel geometry |
| `inputs-card` | `agriculture inputs2.jpg` | Applicator rig distributing at scale |
| `inputs-detail` | `agriculture inputs1.jpg` | Portioned granular input — photo strip only |
| `crop-monitoring-card` | `crop monitoring.jpg` | Maize seedlings, backlit |
| `advisory-card` | `farmer advisory.jpg` | Hands and grain |
| `value-chain-card` | `land profiling.jpg` | Workers carrying harvest crates |
| `livestock-card` | `livestock1.jpg` | Ear-tagged herd — a registry |
| `livestock-detail` | `livestock2.jpg` | Backlit herd — photo strip only |

`inputs-card` is cropped tighter to the field: its flat grey sky reads cool
against bone. `inputs-detail` is a still-life and is off-register against the
outdoor documentary style, so it appears only in the photo strip, never as a card.

Module photo strips use the module card image plus its detail spare; modules
without a spare pair with a hero frame.

## Visual language

**Palette.** Bone `#F7F4EC` ground, `#EFEADC` alternating band, `#FFFDF7`
surface, deep soil `#241C14` ink, `#6E6153` muted, `#E0D9C7` hairline. Field
green `#3C6B3F` and clay `#9A5B3A` appear in photography and rules only.

Harvest gold `#C8912F` takes **exactly one role per view**: the scroll cue on the
hero, the rule drawing under a card title on hover, the Open control on a module
page. Nowhere else.

**Type.** Fraunces for display, Inter Tight for UI, both self-hosted variable
woff2 in `/public/fonts`. No CDN. Hero headline `clamp(3rem, 9vw, 8rem)` at
`0.92` leading and `-0.03em` tracking. The contrast between a large serif and
13px tabular grotesque metadata carries the premium feel — not shadows, not
gradients.

**Constraints.** 2px radius, no box-shadows: cards separate by hairline and
photo frame. No all-caps eyebrow labels; module identity is a tabular `01` beside
the serif title. The hero scrim is the only gradient and it is functional.
Buttons read `Open`, with no arrow glyph. No emoji.

## Screens

**Sign-in.** Split layout, `advisory-card` full-bleed on one side, form on bone.
Real GeoHub username and password. "Continue with ArcGIS Enterprise" is a
disabled affordance carrying the OAuth 2.0 TODO; `PORTAL_CLIENT_ID` and
`PORTAL_CLIENT_SECRET` already select the OAuth password grant server-side when
set.

**Portal.** Hero with two-frame Ken Burns, warm scrim, headline words rising in
sequence, gold scroll cue. Then animated counters 6/6/44. Then the module grid as
editorial cards, staggered on `whileInView`, image scaling inside a fixed frame
while the gold rule draws left to right. Then alternating full-width feature
bands, image parallaxing, sides flipping per module. Then footer.

**Module detail.** Page transition, photo strip, application cards with Open,
then the full feature list.

**App viewer.** Proxied iframe under portal chrome with a back control and the
module name retained.

**Nav.** Transparent over the hero, solid bone with a hairline border after
scroll. Carries the signed-in user's name and sign-out.

## Motion and accessibility

Every animation is gated on `useReducedMotion`: Ken Burns holds a still frame,
reveals become instant, parallax is off, counters snap to their final value.
`:focus-visible` gives a soil ring offset against bone. The skip link moves focus
manually, because under HashRouter the fragment is the route and letting the
anchor navigate would blank the page. Responsive to mobile throughout.

## Server

`server/access-server.js` is ported from `Natural-resource` with its hard-won
behaviour intact, and each of these exists because of a bug already paid for:

- The token is minted with `client=referer` and must be presented with the same
  referer it was bound to, derived per request rather than from a configured
  origin.
- `x-frame-options`, CSP, and `strict-transport-security` are stripped from
  proxied responses. Forwarding HSTS would impose the portal's transport policy
  on this origin.
- `X-Frame-Options: SAMEORIGIN` is re-asserted so the proxy is not an open
  framing bypass.
- Only absolute portal URLs are rewritten; root-relative paths are left alone, or
  the proxy prefix compounds on every request.
- `allSSL`/`ssl` are neutralised only when serving over http, never in production.
- Repeated proxy prefixes are collapsed rather than 500ing.
- ArcGIS Server is proxied separately at `/api/portal/srv`, because dashboards
  fetch layers from `/server`, not `/portal`.
- `ETag` and `Last-Modified` are dropped on rewritten bodies.

The session cookie is renamed `rsa_agri_session` so the two portals do not
collide on localhost. Config is server-side only, never `VITE_` prefixed:
`PORTAL_URL`, `PUBLIC_ORIGIN`, `SESSION_SECRET`, `PORTAL_CLIENT_ID`,
`PORTAL_CLIENT_SECRET`.

## Testing

Vitest with testing-library and jsdom:

- `Counter` reaches its target value and respects reduced motion.
- `modules.js` integrity: 6 modules, 6 applications, 44 features, per-module
  counts, every live app URL under the portal origin, and Farmer Advisory's
  zero-application case.
- `ProtectedRoute` redirects to `/signin` when signed out.
- `embedUrl` maps a portal URL onto the proxy base and leaves foreign URLs alone.
- `ModuleView` renders a module's features and applications.

`scripts/check-data.mjs` runs before `vite build` and fails on a count mismatch.

## Out of scope

Year 3 applications. Any write path to GeoHub. Server-side rendering. A real
OAuth authorization-code flow — the password grant and the marked TODO are the
seam where it plugs in.
