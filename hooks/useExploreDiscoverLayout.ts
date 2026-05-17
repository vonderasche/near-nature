import {
  DEFAULT_EXPLORE_DISCOVER_LAYOUT,
  EXPLORE_DISCOVER_LAYOUT_STORAGE_KEY,
  parseExploreDiscoverLayoutMode,
  type ExploreDiscoverLayoutMode,
} from '@/lib/explore/exploreDiscoverLayout';
import { usePersistedPreference } from '@/hooks/usePersistedPreference';

export function useExploreDiscoverLayout() {
  const { value: layoutMode, setValue: setLayout } = usePersistedPreference<ExploreDiscoverLayoutMode>(
    EXPLORE_DISCOVER_LAYOUT_STORAGE_KEY,
    parseExploreDiscoverLayoutMode,
    DEFAULT_EXPLORE_DISCOVER_LAYOUT,
  );
  return { layoutMode, setLayout };
}
