import { floridaStateParkListKey } from '@/lib/parks/formatFloridaStatePark';
import type { DiscoverSpeciesEntry } from '@/types/discover-species';
import type { FloridaStatePark } from '@/types/florida-state-park';

const stagedParks = new Map<string, FloridaStatePark>();
const stagedSpecies = new Map<string, DiscoverSpeciesEntry>();

export function discoverSpeciesCacheKey(kind: string, name: string): string {
  return `${kind}:${name}`;
}

export function stageDiscoverPark(park: FloridaStatePark): void {
  stagedParks.set(floridaStateParkListKey(park), park);
  stagedParks.set(park.parkId, park);
}

export function getStagedDiscoverPark(key: string): FloridaStatePark | undefined {
  return stagedParks.get(key);
}

export function stageDiscoverSpecies(entry: DiscoverSpeciesEntry): void {
  stagedSpecies.set(discoverSpeciesCacheKey(entry.kind, entry.name), entry);
}

export function getStagedDiscoverSpecies(kind: string, name: string): DiscoverSpeciesEntry | undefined {
  return stagedSpecies.get(discoverSpeciesCacheKey(kind, name));
}

export function findFloridaStatePark(
  parks: readonly FloridaStatePark[],
  parkId: string,
  latitude?: number | null,
  longitude?: number | null,
): FloridaStatePark | undefined {
  const staged = getStagedDiscoverPark(parkId);
  if (staged && staged.parkId === parkId) return staged;

  const matches = parks.filter((park) => park.parkId === parkId);
  if (matches.length === 0) return undefined;
  if (matches.length === 1) return matches[0];
  if (latitude != null && longitude != null) {
    return matches.find((park) => park.latitude === latitude && park.longitude === longitude) ?? matches[0];
  }
  return matches[0];
}

export function findDiscoverSpeciesEntry(
  entries: readonly DiscoverSpeciesEntry[],
  kind: string,
  name: string,
): DiscoverSpeciesEntry | undefined {
  return (
    getStagedDiscoverSpecies(kind, name) ??
    entries.find((entry) => entry.kind === kind && entry.name === name)
  );
}
