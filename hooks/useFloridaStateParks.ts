import { useCallback, useMemo } from 'react';

import { FLORIDA_PARKS_CACHE_MAX_AGE_MS } from '@/constants/florida-parks-cache';
import { useCacheFirstFetch } from '@/hooks/useCacheFirstFetch';
import { aggregateDiscoverSpecies, searchDiscoverSpecies } from '@/lib/parks/aggregateDiscoverSpecies';
import {
  loadCachedFloridaStateParksEntry,
  saveCachedFloridaStateParks,
} from '@/lib/parks/floridaStateParksCache';
import {
  clearInMemoryFloridaStateParks,
  loadFloridaStateParksFromBundledCsv,
  setInMemoryFloridaStateParks,
} from '@/lib/parks/loadFloridaStateParks';
import type { DiscoverParkSortMode } from '@/lib/parks/discoverParkSort';
import { searchFloridaStateParks } from '@/lib/parks/searchFloridaStateParks';
import { sortFloridaStateParks, type DeviceCoordinates } from '@/lib/parks/sortFloridaStateParks';
import type { DiscoverSpeciesEntry } from '@/types/discover-species';
import type { FloridaStatePark } from '@/types/florida-state-park';

export function useFloridaStateParks(
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
} {
  const {
    data: allParks,
    loading: isLoading,
    refreshing: isRefreshing,
    error,
    refetch: refetchParks,
  } = useCacheFirstFetch<FloridaStatePark[]>({
    enabled: true,
    maxAgeMs: FLORIDA_PARKS_CACHE_MAX_AGE_MS,
    loadCache: async () => {
      const entry = await loadCachedFloridaStateParksEntry();
      if (entry) {
        setInMemoryFloridaStateParks(entry.value);
      }
      return entry;
    },
    fetchFresh: async () => {
      clearInMemoryFloridaStateParks();
      const parks = await loadFloridaStateParksFromBundledCsv();
      setInMemoryFloridaStateParks(parks);
      return parks;
    },
    saveCache: saveCachedFloridaStateParks,
    onFresh: (parks) => {
      setInMemoryFloridaStateParks(parks);
    },
    mapError: (err) =>
      err instanceof Error ? err.message : 'Could not load Florida state parks.',
  });

  const refetch = useCallback(
    async (options?: { force?: boolean }) => {
      if (options?.force) {
        clearInMemoryFloridaStateParks();
      }
      await refetchParks({ force: options?.force });
    },
    [refetchParks],
  );

  const parksSource = allParks ?? [];

  const parks = useMemo(() => {
    const filtered = searchFloridaStateParks(parksSource, searchQuery);
    return sortFloridaStateParks(filtered, sortMode, deviceCoords);
  }, [deviceCoords, parksSource, searchQuery, sortMode]);

  const allPlants = useMemo(() => aggregateDiscoverSpecies(parksSource, 'plant'), [parksSource]);
  const allAnimals = useMemo(() => aggregateDiscoverSpecies(parksSource, 'animal'), [parksSource]);

  const plants = useMemo(
    () => searchDiscoverSpecies(allPlants, searchQuery),
    [allPlants, searchQuery],
  );
  const animals = useMemo(
    () => searchDiscoverSpecies(allAnimals, searchQuery),
    [allAnimals, searchQuery],
  );

  return {
    parks,
    plants,
    animals,
    plantCount: allPlants.length,
    animalCount: allAnimals.length,
    totalCount: parksSource.length,
    isLoading,
    isRefreshing,
    error,
    refetch,
  };
}
