import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_EXPLORE_SPECIES_CATEGORY,
  EXPLORE_SPECIES_CATEGORY_STORAGE_KEY,
  parseExploreSpeciesCategory,
  type ExploreSpeciesCategory,
} from '@/lib/explore/exploreSpeciesCategory';

export function useExploreSpeciesCategory() {
  const [category, setCategory] = useState<ExploreSpeciesCategory>(DEFAULT_EXPLORE_SPECIES_CATEGORY);

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(EXPLORE_SPECIES_CATEGORY_STORAGE_KEY).then((raw) => {
      if (!cancelled) setCategory(parseExploreSpeciesCategory(raw));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setCategoryPersisted = useCallback((next: ExploreSpeciesCategory) => {
    setCategory(next);
    void AsyncStorage.setItem(EXPLORE_SPECIES_CATEGORY_STORAGE_KEY, next);
  }, []);

  return { category, setCategory: setCategoryPersisted };
}
