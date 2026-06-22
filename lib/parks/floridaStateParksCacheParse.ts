import {
  FLORIDA_PARKS_CACHE_VERSION,
  type FloridaParksCacheVersion,
} from '@/constants/florida-parks-cache';
import type { FloridaStatePark, ParkSpeciesHighlight } from '@/types/florida-state-park';

export type CachedFloridaStateParks = {
  v: FloridaParksCacheVersion;
  parks: FloridaStatePark[];
  cachedAt: number;
};

function isParkSpeciesHighlight(value: unknown): value is ParkSpeciesHighlight {
  if (!value || typeof value !== 'object') return false;
  const row = value as ParkSpeciesHighlight;
  return typeof row.name === 'string' && typeof row.imageUrl === 'string';
}

function isFloridaStatePark(value: unknown): value is FloridaStatePark {
  if (!value || typeof value !== 'object') return false;
  const park = value as FloridaStatePark;
  return (
    typeof park.parkId === 'string' &&
    typeof park.parkName === 'string' &&
    typeof park.county === 'string' &&
    Array.isArray(park.topPlants) &&
    park.topPlants.every(isParkSpeciesHighlight) &&
    Array.isArray(park.topAnimals) &&
    park.topAnimals.every(isParkSpeciesHighlight)
  );
}

export function parseCachedFloridaStateParks(raw: string | null): CachedFloridaStateParks | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachedFloridaStateParks;
    if (parsed.v !== FLORIDA_PARKS_CACHE_VERSION) return null;
    if (!Array.isArray(parsed.parks) || !parsed.parks.every(isFloridaStatePark)) return null;
    if (typeof parsed.cachedAt !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}
