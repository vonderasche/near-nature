export const DISCOVER_PARK_SORT_OPTIONS = ['name', 'nearest', 'acreage', 'free'] as const;

export type DiscoverParkSortMode = (typeof DISCOVER_PARK_SORT_OPTIONS)[number];

export const DEFAULT_DISCOVER_PARK_SORT: DiscoverParkSortMode = 'name';

export const DISCOVER_PARK_SORT_STORAGE_KEY = '@near_nature/discover_park_sort';

export function parseDiscoverParkSortMode(raw: string | null | undefined): DiscoverParkSortMode {
  if (raw === 'nearest' || raw === 'acreage' || raw === 'free') return raw;
  return DEFAULT_DISCOVER_PARK_SORT;
}

export function discoverParkSortLabel(mode: DiscoverParkSortMode): string {
  switch (mode) {
    case 'name':
      return 'A–Z';
    case 'nearest':
      return 'Nearest';
    case 'acreage':
      return 'Largest';
    case 'free':
      return 'Free first';
  }
}

export function isParkFreeAccess(publicAccess: string): boolean {
  return publicAccess.trim().toLowerCase().includes('no fee');
}
