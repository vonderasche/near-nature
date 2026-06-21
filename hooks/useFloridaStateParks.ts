import { useCallback, useEffect, useMemo, useState } from 'react';

import { aggregateDiscoverSpecies, searchDiscoverSpecies } from '@/lib/parks/aggregateDiscoverSpecies';
import { loadFloridaStateParks } from '@/lib/parks/loadFloridaStateParks';
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
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [allParks, setAllParks] = useState<FloridaStatePark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const parks = await loadFloridaStateParks();
      setAllParks(parks);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load Florida state parks.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const parks = useMemo(() => {
    const filtered = searchFloridaStateParks(allParks, searchQuery);
    return sortFloridaStateParks(filtered, sortMode, deviceCoords);
  }, [allParks, deviceCoords, searchQuery, sortMode]);

  const allPlants = useMemo(() => aggregateDiscoverSpecies(allParks, 'plant'), [allParks]);
  const allAnimals = useMemo(() => aggregateDiscoverSpecies(allParks, 'animal'), [allParks]);

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
    totalCount: allParks.length,
    isLoading,
    error,
    refetch,
  };
}
