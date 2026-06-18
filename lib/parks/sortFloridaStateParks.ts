import { haversineMiles } from '@/lib/geo/haversineMiles';
import { isParkFreeAccess } from '@/lib/parks/discoverParkSort';
import type { DiscoverParkSortMode } from '@/lib/parks/discoverParkSort';
import type { FloridaStatePark } from '@/types/florida-state-park';

export type DeviceCoordinates = {
  latitude: number;
  longitude: number;
};

function compareParkName(a: FloridaStatePark, b: FloridaStatePark): number {
  return a.parkName.localeCompare(b.parkName, undefined, { sensitivity: 'base' });
}

function sortByName(parks: readonly FloridaStatePark[]): FloridaStatePark[] {
  return [...parks].sort(compareParkName);
}

function sortByAcreage(parks: readonly FloridaStatePark[]): FloridaStatePark[] {
  return [...parks].sort((a, b) => {
    const aAcreage = a.acreage ?? -1;
    const bAcreage = b.acreage ?? -1;
    if (bAcreage !== aAcreage) return bAcreage - aAcreage;
    return compareParkName(a, b);
  });
}

function sortByFreeAccess(parks: readonly FloridaStatePark[]): FloridaStatePark[] {
  return [...parks].sort((a, b) => {
    const aFree = isParkFreeAccess(a.publicAccess);
    const bFree = isParkFreeAccess(b.publicAccess);
    if (aFree !== bFree) return aFree ? -1 : 1;
    return compareParkName(a, b);
  });
}

function sortByNearest(
  parks: readonly FloridaStatePark[],
  coords: DeviceCoordinates | null,
): FloridaStatePark[] {
  if (!coords) return sortByName(parks);

  return [...parks].sort((a, b) => {
    const aDistance =
      a.latitude != null && a.longitude != null
        ? haversineMiles(coords.latitude, coords.longitude, a.latitude, a.longitude)
        : Number.POSITIVE_INFINITY;
    const bDistance =
      b.latitude != null && b.longitude != null
        ? haversineMiles(coords.latitude, coords.longitude, b.latitude, b.longitude)
        : Number.POSITIVE_INFINITY;

    if (aDistance !== bDistance) return aDistance - bDistance;
    return compareParkName(a, b);
  });
}

export function sortFloridaStateParks(
  parks: readonly FloridaStatePark[],
  sortMode: DiscoverParkSortMode,
  coords: DeviceCoordinates | null = null,
): FloridaStatePark[] {
  switch (sortMode) {
    case 'nearest':
      return sortByNearest(parks, coords);
    case 'acreage':
      return sortByAcreage(parks);
    case 'free':
      return sortByFreeAccess(parks);
    case 'name':
    default:
      return sortByName(parks);
  }
}
