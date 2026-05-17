import type { ExploreSpecies } from '@/lib/explore/exploreSpeciesTypes';

export const EXPLORE_SPECIES_SORT_OPTIONS = ['rank', 'observations', 'name'] as const;

export type ExploreSpeciesSortMode = (typeof EXPLORE_SPECIES_SORT_OPTIONS)[number];

export const DEFAULT_EXPLORE_SPECIES_SORT: ExploreSpeciesSortMode = 'rank';

export const EXPLORE_SPECIES_SORT_STORAGE_KEY = '@near_nature/explore_species_sort';

export const EXPLORE_SPECIES_SORT_MENU_TITLE = 'Sort by';

export function isExploreSpeciesSortMode(raw: string | null | undefined): raw is ExploreSpeciesSortMode {
  return EXPLORE_SPECIES_SORT_OPTIONS.includes(raw as ExploreSpeciesSortMode);
}

export function parseExploreSpeciesSortMode(raw: string | null | undefined): ExploreSpeciesSortMode {
  return isExploreSpeciesSortMode(raw) ? raw : DEFAULT_EXPLORE_SPECIES_SORT;
}

export function exploreSpeciesSortLabel(mode: ExploreSpeciesSortMode): string {
  switch (mode) {
    case 'rank':
      return 'Rank';
    case 'observations':
      return 'Observations';
    case 'name':
      return 'Name (A–Z)';
  }
}

export function partitionFeaturedExploreSpecies(items: readonly ExploreSpecies[]): {
  featured: ExploreSpecies[];
  rest: ExploreSpecies[];
} {
  const featured: ExploreSpecies[] = [];
  const rest: ExploreSpecies[] = [];
  for (const item of items) {
    if (item.isFeatured) featured.push(item);
    else rest.push(item);
  }
  return { featured, rest };
}

export function sortExploreSpecies(
  items: readonly ExploreSpecies[],
  mode: ExploreSpeciesSortMode,
): ExploreSpecies[] {
  const copy = [...items];
  switch (mode) {
    case 'observations':
      return copy.sort((a, b) => b.observationsCount - a.observationsCount);
    case 'name':
      return copy.sort((a, b) =>
        a.commonName.localeCompare(b.commonName, undefined, { sensitivity: 'base' }),
      );
    case 'rank':
    default:
      return copy.sort((a, b) => {
        const ar = a.rank > 0 ? a.rank : Number.MAX_SAFE_INTEGER;
        const br = b.rank > 0 ? b.rank : Number.MAX_SAFE_INTEGER;
        return ar - br;
      });
  }
}

export function organizeExploreSpeciesList(
  items: readonly ExploreSpecies[],
  mode: ExploreSpeciesSortMode,
): { featured: ExploreSpecies[]; rest: ExploreSpecies[] } {
  const { featured, rest } = partitionFeaturedExploreSpecies(items);
  return {
    featured: sortExploreSpecies(featured, mode),
    rest: sortExploreSpecies(rest, mode),
  };
}
