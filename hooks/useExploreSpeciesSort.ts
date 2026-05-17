import {
  DEFAULT_EXPLORE_SPECIES_SORT,
  EXPLORE_SPECIES_SORT_STORAGE_KEY,
  parseExploreSpeciesSortMode,
  type ExploreSpeciesSortMode,
} from '@/lib/explore/exploreSpeciesSort';
import { usePersistedPreference } from '@/hooks/usePersistedPreference';

export function useExploreSpeciesSort() {
  const { value: sortMode, setValue: setSort } = usePersistedPreference<ExploreSpeciesSortMode>(
    EXPLORE_SPECIES_SORT_STORAGE_KEY,
    parseExploreSpeciesSortMode,
    DEFAULT_EXPLORE_SPECIES_SORT,
  );
  return { sortMode, setSort };
}
