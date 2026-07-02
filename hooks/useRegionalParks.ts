import { useActiveRegion } from '@/context/RegionContext';
import { useFloridaStateParks } from '@/hooks/useFloridaStateParks';
import type { DiscoverSpeciesEntry } from '@/types/discover-species';
import type { FloridaStatePark } from '@/types/florida-state-park';
import type { DiscoverParkSortMode } from '@/lib/parks/discoverParkSort';
import type { DeviceCoordinates } from '@/lib/parks/sortFloridaStateParks';

export function useRegionalParks(
  searchQuery: string,
  sortMode: DiscoverParkSortMode,
  deviceCoords: DeviceCoordinates | null,
): {
  parks: FloridaStatePark[];
  plants: DiscoverSpeciesEntry[];
  animals: DiscoverSpeciesEntry[];
  plantCount: number;
  animalCount: number;
  totalCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: (options?: { force?: boolean }) => Promise<void>;
  comingSoon: boolean;
} {
  const { isLive, regionId } = useActiveRegion();
  const fl = useFloridaStateParks(searchQuery, sortMode, deviceCoords);

  if (isLive && regionId === 'south') {
    return { ...fl, comingSoon: false };
  }

  return {
    parks: [],
    plants: [],
    animals: [],
    plantCount: 0,
    animalCount: 0,
    totalCount: 0,
    isLoading: false,
    isRefreshing: false,
    error: null,
    refetch: async () => {},
    comingSoon: true,
  };
}
