import type { ExploreSpeciesSortMode } from '@/lib/explore/exploreSpeciesSort';
import type { ExploreSpecies, ExploreSpeciesType } from '@/lib/explore/exploreSpeciesTypes';
import { exploreTypeLabel, EXPLORE_SPECIES_TYPES } from '@/lib/explore/exploreSpeciesTypes';

export type ExploreSpeciesCategory = ExploreSpeciesType | 'all';

export const EXPLORE_SPECIES_CATEGORY_OPTIONS: ExploreSpeciesCategory[] = [
  'all',
  ...EXPLORE_SPECIES_TYPES,
];

export const EXPLORE_SPECIES_CATEGORY_STORAGE_KEY = '@near_nature/explore_species_category';

export const DEFAULT_EXPLORE_SPECIES_CATEGORY: ExploreSpeciesCategory = 'animals';

export function isExploreSpeciesCategory(raw: string | null | undefined): raw is ExploreSpeciesCategory {
  return raw === 'all' || raw === 'animals' || raw === 'plants';
}

export function parseExploreSpeciesCategory(raw: string | null | undefined): ExploreSpeciesCategory {
  return isExploreSpeciesCategory(raw) ? raw : DEFAULT_EXPLORE_SPECIES_CATEGORY;
}

export function exploreSpeciesCategoryMenuTitle(): string {
  return 'Category';
}

export function exploreSpeciesCategoryLabel(category: ExploreSpeciesCategory): string {
  if (category === 'all') return 'All species';
  return exploreTypeLabel(category);
}

export function exploreSpeciesCategoryEmptyLabel(category: ExploreSpeciesCategory): string {
  if (category === 'all') return 'species';
  return exploreTypeLabel(category).toLowerCase();
}

export type ExploreSpeciesByType = Record<ExploreSpeciesType, ExploreSpecies[]>;

export function mergeExploreSpeciesByType(byType: ExploreSpeciesByType): ExploreSpecies[] {
  return [...byType.animals, ...byType.plants];
}

export function exploreSpeciesItemsForCategory(
  byType: ExploreSpeciesByType,
  category: ExploreSpeciesCategory,
): ExploreSpecies[] {
  if (category === 'all') return mergeExploreSpeciesByType(byType);
  return byType[category];
}

export function exploreSpeciesSortForCategory(
  category: ExploreSpeciesCategory,
  sortMode: ExploreSpeciesSortMode,
): ExploreSpeciesSortMode {
  return category === 'all' ? 'observations' : sortMode;
}
