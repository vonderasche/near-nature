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
//   2. Look up place ID for the user's US state (autocomplete, ", US")
//   3. GET taxa/:id?preferred_place_id=… → establishment_means for that state
//   4. Map the result to our SpeciesStatus type
// ─────────────────────────────────────────────────────────────

import {
  mapEstablishmentMeansToSpeciesStatus,
  pickUsStatePlaceId,
} from '@/lib/inaturalist/mapEstablishmentMeans';
import { devLog } from '@/lib/devLog';
import { SpeciesStatus } from '@/types';

const INATURALIST_API = 'https://api.inaturalist.org/v1';

// Cache place IDs so we don't re-fetch the same state repeatedly
const placeIdCache = new Map<string, number>();

// ── Main export ───────────────────────────────────────────────

export interface NativeLookupResult {
  status: SpeciesStatus;
  taxonId: number;
  establishmentMeans: string | null;
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
  const code = stateCode.trim().toUpperCase().slice(0, 2);
  devLog('[inat] lookup start', { latinName, stateCode: code });

  const taxonId = await fetchTaxonId(latinName);
  devLog('[inat] taxonId', { latinName, taxonId });
  if (taxonId === null) return null;

  const placeId = await fetchStatePlaceId(code);
  devLog('[inat] placeId', { stateCode: code, placeId });
  if (placeId === null) return null;

  const means = await fetchEstablishmentMeansForPlace(taxonId, placeId);
  devLog('[inat] establishment', { taxonId, placeId, means });

  const result = {
    status: mapEstablishmentMeansToSpeciesStatus(means),
    taxonId,
    establishmentMeans: means,
  };
  devLog('[inat] result', result);
  return result;
}

// ── Step 1: Taxon search ──────────────────────────────────────

async function fetchTaxonId(latinName: string): Promise<number | null> {
  const q = latinName.trim();
  if (!q) return null;

  const url = `${INATURALIST_API}/taxa?q=${encodeURIComponent(q)}&rank=species&per_page=5`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`iNaturalist taxa search failed: ${response.status}`);
  }

  const data = await response.json();
  const results = data.results as Array<{ id: number; name: string }> | undefined;

  if (!results?.length) return null;

  const exact = results.find((r) => r.name.trim().toLowerCase() === q.toLowerCase());
  return (exact ?? results[0]).id;
}

type TaxonNameRow = { name?: string; lexicon?: string | null };

type TaxonDetailPayload = {
  preferred_common_name?: string;
  matched_term?: string;
  names?: TaxonNameRow[];
};

/**
 * Alternate common names and matched terms from iNaturalist (for species_metadata aliases).
 */
export async function fetchTaxonAlternateNames(latinName: string): Promise<string[]> {
  const taxonId = await fetchTaxonId(latinName);
  if (taxonId === null) return [];

  const url = `${INATURALIST_API}/taxa/${taxonId}`;
  const response = await fetch(url);
  if (!response.ok) return [];

  const data = await response.json();
  const taxon = (Array.isArray(data.results) ? data.results[0] : data) as TaxonDetailPayload | undefined;
  if (!taxon) return [];

  const out = new Set<string>();
  const add = (value: string | undefined) => {
    const t = value?.trim();
    if (t && t.length > 1) out.add(t);
  };

  add(taxon.preferred_common_name);
  add(taxon.matched_term);
  for (const row of taxon.names ?? []) {
    const lex = row.lexicon?.toLowerCase() ?? '';
    if (lex && lex !== 'english' && lex !== 'english (uk)' && lex !== 'english (us)') continue;
    add(row.name);
  }

  return [...out].slice(0, 24);
}

// ── Step 2: US state place ID ─────────────────────────────────

async function fetchStatePlaceId(stateCode: string): Promise<number | null> {
  const code = stateCode.toUpperCase();
  if (placeIdCache.has(code)) {
    return placeIdCache.get(code)!;
  }

  const stateName = STATE_NAMES[code];
  if (!stateName) return null;

  const url = `${INATURALIST_API}/places/autocomplete?q=${encodeURIComponent(stateName)}&place_type=state`;
  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  const results = data.results as Array<{ id: number; name: string; display_name?: string }> | undefined;
  const placeId = pickUsStatePlaceId(results, stateName);
  if (placeId === null) return null;

  placeIdCache.set(code, placeId);
  return placeId;
}

// ── Step 3: Establishment means (taxa + preferred_place_id) ─

type TaxonEstablishmentPayload = {
  establishment_means?: string | { establishment_means?: string };
  native_establishment_means?: string;
};

async function fetchEstablishmentMeansForPlace(
  taxonId: number,
  placeId: number,
): Promise<string | null> {
  const url = `${INATURALIST_API}/taxa/${taxonId}?preferred_place_id=${placeId}`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  const taxon = (Array.isArray(data.results) ? data.results[0] : data) as
    | TaxonEstablishmentPayload
    | undefined;
  if (!taxon) return null;

  const nested = taxon.establishment_means;
  if (typeof nested === 'string' && nested.trim()) return nested.trim();
  if (nested && typeof nested === 'object' && typeof nested.establishment_means === 'string') {
    return nested.establishment_means.trim();
  }

  if (typeof taxon.native_establishment_means === 'string' && taxon.native_establishment_means.trim()) {
    return taxon.native_establishment_means.trim();
  }

  return null;
}

// Full state names for place autocomplete
const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};
