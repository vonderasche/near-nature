import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_EXPLORE_SPECIES_SORT,
  EXPLORE_SPECIES_SORT_STORAGE_KEY,
  parseExploreSpeciesSortMode,
  type ExploreSpeciesSortMode,
} from '@/lib/explore/exploreSpeciesSort';

export function useExploreSpeciesSort() {
  const [sortMode, setSortMode] = useState<ExploreSpeciesSortMode>(DEFAULT_EXPLORE_SPECIES_SORT);

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(EXPLORE_SPECIES_SORT_STORAGE_KEY).then((raw) => {
      if (!cancelled) setSortMode(parseExploreSpeciesSortMode(raw));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setSort = useCallback((mode: ExploreSpeciesSortMode) => {
    setSortMode(mode);
    void AsyncStorage.setItem(EXPLORE_SPECIES_SORT_STORAGE_KEY, mode);
  }, []);

  return { sortMode, setSort };
}
