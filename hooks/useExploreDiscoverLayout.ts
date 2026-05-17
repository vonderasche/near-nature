import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_EXPLORE_DISCOVER_LAYOUT,
  EXPLORE_DISCOVER_LAYOUT_STORAGE_KEY,
  parseExploreDiscoverLayoutMode,
  type ExploreDiscoverLayoutMode,
} from '@/lib/explore/exploreDiscoverLayout';

export function useExploreDiscoverLayout() {
  const [layoutMode, setLayoutMode] = useState<ExploreDiscoverLayoutMode>(DEFAULT_EXPLORE_DISCOVER_LAYOUT);

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(EXPLORE_DISCOVER_LAYOUT_STORAGE_KEY).then((raw) => {
      if (!cancelled) setLayoutMode(parseExploreDiscoverLayoutMode(raw));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLayout = useCallback((mode: ExploreDiscoverLayoutMode) => {
    setLayoutMode(mode);
    void AsyncStorage.setItem(EXPLORE_DISCOVER_LAYOUT_STORAGE_KEY, mode);
  }, []);

  return { layoutMode, setLayout };
}
