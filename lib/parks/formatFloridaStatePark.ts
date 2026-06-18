import { haversineMiles } from '@/lib/geo/haversineMiles';
import type { DeviceCoordinates } from '@/lib/parks/sortFloridaStateParks';
import type { FloridaStatePark } from '@/types/florida-state-park';

/** Stable React list key; park_id alone is not unique (some units have multiple entrances). */
export function floridaStateParkListKey(park: FloridaStatePark): string {
  if (park.latitude != null && park.longitude != null) {
    return `${park.parkId}@${park.latitude},${park.longitude}`;
  }
  return `${park.parkId}@${park.parkName}`;
}

export function formatDistanceMiles(miles: number): string {
  if (miles < 0.1) return '< 0.1 mi';
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

export function parkDistanceMiles(
  park: FloridaStatePark,
  coords: DeviceCoordinates | null,
): number | null {
  if (!coords || park.latitude == null || park.longitude == null) return null;
  return haversineMiles(coords.latitude, coords.longitude, park.latitude, park.longitude);
}

export function formatParkAcreage(acreage: number | null): string | null {
  if (acreage == null || !Number.isFinite(acreage)) return null;
  const rounded = Math.round(acreage);
  return `${rounded.toLocaleString('en-US')} acres`;
}

export function formatParkLocation(park: FloridaStatePark): string {
  const city = park.city.trim();
  const county = park.county.trim();
  if (city && county) {
    return `${city} · ${county} County`;
  }
  if (county) {
    return `${county} County`;
  }
  if (city) {
    return city;
  }
  return park.state.trim() || 'Florida';
}

export function formatParkAccessLabel(publicAccess: string): string | null {
  const trimmed = publicAccess.trim();
  if (!trimmed) return null;
  return trimmed.replace(/^Open-/i, '').replace(/-/g, ' ');
}

export function formatParkMeta(
  park: FloridaStatePark,
  options?: { distanceMiles?: number | null },
): string {
  const parts: string[] = [];
  if (options?.distanceMiles != null && Number.isFinite(options.distanceMiles)) {
    parts.push(formatDistanceMiles(options.distanceMiles));
  }
  parts.push(formatParkLocation(park));
  const acreage = formatParkAcreage(park.acreage);
  if (acreage) parts.push(acreage);
  const access = formatParkAccessLabel(park.publicAccess);
  if (access) parts.push(access);
  return parts.join(' · ');
}

export function formatSpeciesPreview(species: readonly string[], max = 3): string | null {
  if (species.length === 0) return null;
  const preview = species.slice(0, max).join(', ');
  if (species.length <= max) return preview;
  return `${preview} +${species.length - max} more`;
}
