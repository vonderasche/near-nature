export const DISCOVER_SPECIES_SORT_OPTIONS = ['name', 'park_count'] as const;

export type DiscoverSpeciesSortMode = (typeof DISCOVER_SPECIES_SORT_OPTIONS)[number];

export const DEFAULT_DISCOVER_SPECIES_SORT: DiscoverSpeciesSortMode = 'name';

export const DISCOVER_PLANT_SORT_STORAGE_KEY = '@near_nature/discover_plant_sort';
export const DISCOVER_ANIMAL_SORT_STORAGE_KEY = '@near_nature/discover_animal_sort';

export function parseDiscoverSpeciesSortMode(raw: string | null | undefined): DiscoverSpeciesSortMode {
  if (raw === 'park_count') return 'park_count';
  return DEFAULT_DISCOVER_SPECIES_SORT;
}

export function discoverSpeciesSortLabel(mode: DiscoverSpeciesSortMode): string {
  switch (mode) {
    case 'name':
      return 'A–Z';
    case 'park_count':
      return 'Most parks';
  }
}
