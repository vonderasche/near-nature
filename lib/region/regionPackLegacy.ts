import { isRegionPackId, type RegionPackId } from '@/constants/regions';

/** Retired 5-region pack IDs → US Census region. */
export const LEGACY_REGION_PACK_ALIASES: Record<string, RegionPackId> = {
  southeast: 'south',
  southwest: 'west',
  northwest: 'west',
};

/** Legacy on-device / Supabase folder names still checked after the canonical id. */
export const REGION_MODEL_STORAGE_ALIASES: Partial<Record<RegionPackId, readonly string[]>> = {
  south: ['southeast'],
  west: ['southwest', 'northwest'],
};

export function normalizeRegionPackId(value: string | null | undefined): RegionPackId | null {
  if (!value) return null;
  if (isRegionPackId(value)) return value;
  return LEGACY_REGION_PACK_ALIASES[value] ?? null;
}

export function getRegionModelStorageCandidates(regionId: RegionPackId): readonly string[] {
  const aliases = REGION_MODEL_STORAGE_ALIASES[regionId] ?? [];
  return [regionId, ...aliases];
}
