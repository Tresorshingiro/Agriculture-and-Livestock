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
        id: 'soil-information-mapping',
        name: 'Soil Information Mapping',
        url: `${GEOHUB}/apps/dashboards/bb2735551a6648a1ba5ede6655b1212c`,
        year: 'Year 1',
      },
      {
        id: 'land-profiling-crops-suitability',
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
        id: 'farming-inputs-distribution',
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
        id: 'crops-health-monitoring',
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
        id: 'export-crops-supply-chain',
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
        id: 'animal-resources-distribution',
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
