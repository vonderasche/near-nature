import type { UsStateCode } from '@/constants/us-states';
import { normalizeUsStateCode, US_STATES } from '@/constants/us-states';

/** US Census Bureau regions (lower 48). */
export const REGION_PACK_IDS = ['northeast', 'midwest', 'south', 'west'] as const;

export type RegionPackId = (typeof REGION_PACK_IDS)[number];

export type RegionAvailability = 'live' | 'coming_soon';

export type RegionPackConfig = {
  id: RegionPackId;
  label: string;
  states: readonly UsStateCode[];
  availability: RegionAvailability;
};

/** Lower-48 states excluded from regional packs (shown off the profile map). */
export const REGION_EXCLUDED_STATE_CODES = ['AK', 'HI'] as const satisfies readonly UsStateCode[];

export const REGION_PACKS: Record<RegionPackId, RegionPackConfig> = {
  northeast: {
    id: 'northeast',
    label: 'Northeast',
    states: ['CT', 'ME', 'MA', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT'],
    availability: 'coming_soon',
  },
  midwest: {
    id: 'midwest',
    label: 'Midwest',
    states: ['IA', 'IL', 'IN', 'KS', 'MI', 'MN', 'MO', 'ND', 'NE', 'OH', 'SD', 'WI'],
    availability: 'coming_soon',
  },
  south: {
    id: 'south',
    label: 'South',
    states: [
      'AL',
      'AR',
      'DE',
      'FL',
      'GA',
      'KY',
      'LA',
      'MD',
      'MS',
      'NC',
      'OK',
      'SC',
      'TN',
      'TX',
      'VA',
      'WV',
    ],
    availability: 'live',
  },
  west: {
    id: 'west',
    label: 'West',
    states: ['AZ', 'CA', 'CO', 'ID', 'MT', 'NM', 'NV', 'OR', 'UT', 'WA', 'WY'],
    availability: 'coming_soon',
  },
};

export const DEFAULT_REGION_PACK_ID: RegionPackId = 'south';

const STATE_TO_REGION: Partial<Record<UsStateCode, RegionPackId>> = (() => {
  const map: Partial<Record<UsStateCode, RegionPackId>> = {};
  for (const pack of Object.values(REGION_PACKS)) {
    for (const state of pack.states) {
      map[state] = pack.id;
    }
  }
  return map;
})();

/** All US state codes assigned to a regional pack (lower 48). */
export const REGION_MAPPED_STATE_CODES: readonly UsStateCode[] = US_STATES.map((s) => s.code).filter(
  (code): code is UsStateCode =>
    !(REGION_EXCLUDED_STATE_CODES as readonly string[]).includes(code) &&
    STATE_TO_REGION[code as UsStateCode] != null,
);

export function isRegionPackId(value: string | null | undefined): value is RegionPackId {
  return REGION_PACK_IDS.includes(value as RegionPackId);
}

export function isRegionLive(regionId: RegionPackId): boolean {
  return REGION_PACKS[regionId].availability === 'live';
}

export function regionLabel(regionId: RegionPackId): string {
  return REGION_PACKS[regionId].label;
}

export function regionDisplayLabel(regionId: RegionPackId): string {
  return regionLabel(regionId);
}

export function statesInRegion(regionId: RegionPackId): readonly UsStateCode[] {
  return REGION_PACKS[regionId].states;
}

export function regionPackForState(stateCode: string | null | undefined): RegionPackId | null {
  const normalized = normalizeUsStateCode(stateCode);
  if (!normalized) return null;
  return STATE_TO_REGION[normalized] ?? null;
}

export function resolveRegionFromState(stateCode: string | null | undefined): RegionPackId {
  return regionPackForState(stateCode) ?? DEFAULT_REGION_PACK_ID;
}
