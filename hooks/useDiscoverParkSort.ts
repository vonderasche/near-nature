import {
  DEFAULT_DISCOVER_PARK_SORT,
  DISCOVER_PARK_SORT_STORAGE_KEY,
  parseDiscoverParkSortMode,
  type DiscoverParkSortMode,
} from '@/lib/parks/discoverParkSort';
import { usePersistedPreference } from '@/hooks/usePersistedPreference';

export function useDiscoverParkSort() {
  const { value: sortMode, setValue: setSortMode } = usePersistedPreference<DiscoverParkSortMode>(
    DISCOVER_PARK_SORT_STORAGE_KEY,
    parseDiscoverParkSortMode,
    DEFAULT_DISCOVER_PARK_SORT,
  );
  return { sortMode, setSortMode };
}
