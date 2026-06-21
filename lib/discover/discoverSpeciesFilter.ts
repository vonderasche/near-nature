import type { DiscoverSpeciesSubcategoryId } from '@/lib/discover/discoverSpeciesSubcategories';
import type { DiscoverSpeciesSortMode } from '@/lib/discover/discoverSpeciesSort';
import type { DiscoverSpeciesEntry } from '@/types/discover-species';

export type DiscoverSpeciesSubcategoryFilter =
  | { kind: 'all' }
  | { kind: 'subcategory'; subcategory: DiscoverSpeciesSubcategoryId };

export const DEFAULT_DISCOVER_SPECIES_FILTER: DiscoverSpeciesSubcategoryFilter = { kind: 'all' };

export const DISCOVER_PLANT_FILTER_STORAGE_KEY = '@near_nature/discover_plant_filter';
export const DISCOVER_ANIMAL_FILTER_STORAGE_KEY = '@near_nature/discover_animal_filter';

export function parseDiscoverSpeciesFilter(raw: string | null | undefined): DiscoverSpeciesSubcategoryFilter {
  if (!raw || raw === 'all') return DEFAULT_DISCOVER_SPECIES_FILTER;
  return { kind: 'subcategory', subcategory: raw as DiscoverSpeciesSubcategoryId };
}

export function serializeDiscoverSpeciesFilter(filter: DiscoverSpeciesSubcategoryFilter): string {
  if (filter.kind === 'all') return 'all';
  return filter.subcategory;
}

export function filterDiscoverSpecies(
  entries: readonly DiscoverSpeciesEntry[],
  filter: DiscoverSpeciesSubcategoryFilter,
): DiscoverSpeciesEntry[] {
  if (filter.kind === 'all') return [...entries];
  return entries.filter((entry) => entry.subcategoryId === filter.subcategory);
}

export function sortDiscoverSpecies(
  entries: readonly DiscoverSpeciesEntry[],
  mode: DiscoverSpeciesSortMode,
): DiscoverSpeciesEntry[] {
  const sorted = [...entries];
  if (mode === 'park_count') {
    return sorted.sort((a, b) => {
      const countDiff = b.parkCount - a.parkCount;
      if (countDiff !== 0) return countDiff;
      return a.name.localeCompare(b.name);
    });
  }
  return sorted.sort((a, b) => a.name.localeCompare(b.name));
}
