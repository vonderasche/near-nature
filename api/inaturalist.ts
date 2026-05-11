// ─────────────────────────────────────────────────────────────
// src/api/inaturalist.ts
//
// Looks up whether a species is native, invasive, or non-native
// to a given US state using the iNaturalist API.
//
// Free — no API key required.
//
// FLOW:
//   1. Search taxa by Latin name → get taxon ID
//   2. Look up place ID for the user's state
//   3. Check establishment means for that taxon in that place
//   4. Map the result to our SpeciesStatus type
// ─────────────────────────────────────────────────────────────

import { SpeciesStatus } from '@/types';

const INATURALIST_API = 'https://api.inaturalist.org/v1';

function devLog(...args: unknown[]) {
  if (__DEV__) console.log(...args);
}

// Cache place IDs so we don't re-fetch the same state repeatedly
const placeIdCache = new Map<string, number>();

// ── Main export ───────────────────────────────────────────────

export interface NativeLookupResult {
  status:           SpeciesStatus;
  taxonId:          number;
  establishmentMeans: string | null;  // raw value from iNaturalist
}

/**
 * Look up whether a species is native, invasive, or non-native
 * to the given US state.
 *
 * @param latinName - Scientific species name e.g. "Danaus plexippus"
 * @param stateCode - Two-letter US state code e.g. "VA"
 * @returns         - Status result, or null if the species isn't found
 */
export async function lookupNativeStatus(
  latinName: string,
  stateCode: string,
): Promise<NativeLookupResult | null> {
  devLog('[inat] lookup start', { latinName, stateCode });

  // Step 1: find the taxon ID
  const taxonId = await fetchTaxonId(latinName);
  devLog('[inat] taxonId', { latinName, taxonId });
  if (taxonId === null) return null;

  // Step 2: find the iNaturalist place ID for the state
  const placeId = await fetchStatePlaceId(stateCode);
  devLog('[inat] placeId', { stateCode, placeId });
  if (placeId === null) return null;

  // Step 3: check establishment means for this taxon in this place
  const means = await fetchEstablishmentMeans(taxonId, placeId);
  devLog('[inat] establishment', { taxonId, placeId, means });

  const result = {
    status:             mapToSpeciesStatus(means),
    taxonId,
    establishmentMeans: means,
  };
  devLog('[inat] result', result);
  return result;
}

// ── Step 1: Taxon search ──────────────────────────────────────

async function fetchTaxonId(latinName: string): Promise<number | null> {
  const url = `${INATURALIST_API}/taxa?q=${encodeURIComponent(latinName)}&rank=species&per_page=1`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`iNaturalist taxa search failed: ${response.status}`);
  }

  const data = await response.json();
  const results = data.results as Array<{ id: number; name: string }> | undefined;

  if (!results || results.length === 0) return null;

  // iNaturalist returns the closest match first
  return results[0].id;
}

// ── Step 2: State place ID ────────────────────────────────────

async function fetchStatePlaceId(stateCode: string): Promise<number | null> {
  // Return cached value if we already looked this up
  if (placeIdCache.has(stateCode)) {
    return placeIdCache.get(stateCode)!;
  }

  // Check hardcoded map first to avoid unnecessary API calls
  const hardcoded = STATE_PLACE_IDS[stateCode.toUpperCase()];
  if (hardcoded) {
    placeIdCache.set(stateCode, hardcoded);
    return hardcoded;
  }

  // Fall back to autocomplete search
  const stateName = STATE_NAMES[stateCode.toUpperCase()];
  if (!stateName) return null;

  const url = `${INATURALIST_API}/places/autocomplete?q=${encodeURIComponent(stateName)}&place_type=state`;
  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  const results = data.results as Array<{ id: number; name: string; place_type: number }> | undefined;
  if (!results || results.length === 0) return null;

  // Find the result that matches the state name exactly
  const match = results.find(
    (r) => r.name.toLowerCase() === stateName.toLowerCase(),
  );
  const placeId = match?.id ?? results[0].id;
  placeIdCache.set(stateCode, placeId);
  return placeId;
}

// ── Step 3: Establishment means ───────────────────────────────

async function fetchEstablishmentMeans(
  taxonId: number,
  placeId: number,
): Promise<string | null> {
  const url = `${INATURALIST_API}/listed_taxa?taxon_id=${taxonId}&place_id=${placeId}&per_page=1`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  const results = data.results as Array<{ establishment_means?: string }> | undefined;

  if (!results || results.length === 0) return null;
  return results[0].establishment_means ?? null;
}

// ── Status mapping ────────────────────────────────────────────

/**
 * Maps iNaturalist's establishment_means values to our 3-state SpeciesStatus.
 *
 * iNaturalist values: native, endemic, introduced, naturalised,
 *                     invasive, widespread invasive, managed, vagrant
 */
function mapToSpeciesStatus(means: string | null): SpeciesStatus {
  if (means === null) return 'non-native'; // unknown — conservative default

  const lower = means.toLowerCase();

  if (lower === 'native' || lower === 'endemic') {
    return 'native';
  }

  if (lower === 'invasive' || lower === 'widespread invasive') {
    return 'invasive';
  }

  // introduced, naturalised, managed, vagrant → non-native
  return 'non-native';
}

// ── Data: US state codes → iNaturalist place IDs ──────────────
// Hardcoded for the most common states to avoid extra API calls.
// Source: https://www.inaturalist.org/places
// If a state is missing, fetchStatePlaceId() falls back to the
// autocomplete API and caches the result.

const STATE_PLACE_IDS: Record<string, number> = {
  AL: 36407,  AK: 36408,  AZ: 36409,  AR: 36410,  CA: 14,
  CO: 36411,  CT: 36412,  DE: 36413,  FL: 36415,  GA: 36416,
  HI: 36417,  ID: 36418,  IL: 36419,  IN: 36420,  IA: 36421,
  KS: 36422,  KY: 36423,  LA: 36424,  ME: 36425,  MD: 36426,
  MA: 36427,  MI: 36428,  MN: 36429,  MS: 36430,  MO: 36431,
  MT: 36432,  NE: 36433,  NV: 36434,  NH: 36435,  NJ: 36436,
  NM: 36437,  NY: 36438,  NC: 36439,  ND: 36440,  OH: 36441,
  OK: 36442,  OR: 36443,  PA: 36444,  RI: 36445,  SC: 36446,
  SD: 36447,  TN: 36448,  TX: 36449,  UT: 36450,  VT: 36451,
  VA: 36452,  WA: 36453,  WV: 36454,  WI: 36455,  WY: 36456,
};

// Full state names for autocomplete fallback
const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama',        AK: 'Alaska',         AZ: 'Arizona',
  AR: 'Arkansas',       CA: 'California',     CO: 'Colorado',
  CT: 'Connecticut',    DE: 'Delaware',        FL: 'Florida',
  GA: 'Georgia',        HI: 'Hawaii',          ID: 'Idaho',
  IL: 'Illinois',       IN: 'Indiana',         IA: 'Iowa',
  KS: 'Kansas',         KY: 'Kentucky',        LA: 'Louisiana',
  ME: 'Maine',          MD: 'Maryland',        MA: 'Massachusetts',
  MI: 'Michigan',       MN: 'Minnesota',       MS: 'Mississippi',
  MO: 'Missouri',       MT: 'Montana',         NE: 'Nebraska',
  NV: 'Nevada',         NH: 'New Hampshire',   NJ: 'New Jersey',
  NM: 'New Mexico',     NY: 'New York',        NC: 'North Carolina',
  ND: 'North Dakota',   OH: 'Ohio',            OK: 'Oklahoma',
  OR: 'Oregon',         PA: 'Pennsylvania',    RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota',    TN: 'Tennessee',
  TX: 'Texas',          UT: 'Utah',            VT: 'Vermont',
  VA: 'Virginia',       WA: 'Washington',      WV: 'West Virginia',
  WI: 'Wisconsin',      WY: 'Wyoming',
};
