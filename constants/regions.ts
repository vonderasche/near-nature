import type { UsStateCode } from '@/constants/us-states';
import { normalizeUsStateCode } from '@/constants/us-states';

export const REGION_PACK_IDS = ['southeast', 'northeast', 'midwest', 'southwest'] as const;

export type RegionPackId = (typeof REGION_PACK_IDS)[number];

export type RegionAvailability = 'live' | 'coming_soon';

export type RegionPackConfig = {
  id: RegionPackId;
  label: string;
  states: readonly UsStateCode[];
  availability: RegionAvailability;
};

export const REGION_PACKS: Record<RegionPackId, RegionPackConfig> = {
  southeast: {
    id: 'southeast',
    label: 'Southeast',
    states: ['FL', 'GA', 'SC', 'NC', 'AL', 'MS', 'TN'],
    availability: 'live',
  },
  northeast: {
    id: 'northeast',
    label: 'Northeast',
    states: ['NY', 'NJ', 'PA', 'CT', 'MA', 'VA', 'MD', 'OH'],
    availability: 'coming_soon',
  },
  midwest: {
    id: 'midwest',
    label: 'Midwest',
    states: ['OH', 'IN', 'IL', 'MI', 'WI', 'MN', 'MO'],
    availability: 'coming_soon',
  },
  southwest: {
    id: 'southwest',
    label: 'Southwest',
    states: ['TX', 'AZ', 'NM', 'CA', 'NV', 'CO', 'UT'],
    availability: 'coming_soon',
  },
};

export const DEFAULT_REGION_PACK_ID: RegionPackId = 'southeast';

const STATE_TO_REGION: Partial<Record<UsStateCode, RegionPackId>> = (() => {
  const map: Partial<Record<UsStateCode, RegionPackId>> = {};
  for (const pack of Object.values(REGION_PACKS)) {
    for (const state of pack.states) {
      if (state === 'OH' && pack.id === 'northeast') continue;
      map[state] = pack.id;
    }
  }
  return map;
})();

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
