import {
  DEFAULT_EXPLORE_SPECIES_CATEGORY,
  EXPLORE_SPECIES_CATEGORY_STORAGE_KEY,
  parseExploreSpeciesCategory,
  type ExploreSpeciesCategory,
} from '@/lib/explore/exploreSpeciesCategory';
import { usePersistedPreference } from '@/hooks/usePersistedPreference';

export function useExploreSpeciesCategory() {
  const { value: category, setValue: setCategory } = usePersistedPreference<ExploreSpeciesCategory>(
    EXPLORE_SPECIES_CATEGORY_STORAGE_KEY,
    parseExploreSpeciesCategory,
    DEFAULT_EXPLORE_SPECIES_CATEGORY,
  );
  return { category, setCategory };
}
