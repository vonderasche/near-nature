import {
  DEFAULT_DISCOVER_BROWSE,
  DISCOVER_BROWSE_STORAGE_KEY,
  parseDiscoverBrowseMode,
  type DiscoverBrowseMode,
} from '@/lib/discover/discoverBrowseMode';
import { usePersistedPreference } from '@/hooks/usePersistedPreference';

export function useDiscoverBrowseMode() {
  const { value: browseMode, setValue: setBrowseMode } = usePersistedPreference<DiscoverBrowseMode>(
    DISCOVER_BROWSE_STORAGE_KEY,
    parseDiscoverBrowseMode,
    DEFAULT_DISCOVER_BROWSE,
  );
  return { browseMode, setBrowseMode };
}
