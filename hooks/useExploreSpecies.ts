import { useCallback, useEffect, useState } from 'react';

import type { ExploreSpeciesByType } from '@/lib/explore/exploreSpeciesCategory';
import type { ExploreSpeciesType } from '@/lib/explore/exploreSpeciesTypes';
import { EXPLORE_SPECIES_TYPES } from '@/lib/explore/exploreSpeciesTypes';
import { fetchExploreSpecies } from '@/services/exploreSpeciesService';

export type { ExploreSpeciesByType };

type UseExploreSpeciesResult = {
  byType: ExploreSpeciesByType;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const emptyByType = (): ExploreSpeciesByType => ({
  animals: [],
  plants: [],
});

export function useExploreSpecies(stateName: string | null): UseExploreSpeciesResult {
  const [byType, setByType] = useState<ExploreSpeciesByType>(emptyByType);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    const state = stateName?.trim() ?? '';
    if (!state) {
      setByType(emptyByType());
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        EXPLORE_SPECIES_TYPES.map(async (type) => {
          const rows = await fetchExploreSpecies(state, type);
          return [type, rows] as const;
        }),
      );
      const next = emptyByType();
      for (const [type, rows] of results) {
        next[type] = rows;
      }
      setByType(next);
    } catch (e) {
      setByType(emptyByType());
      setError(
        e instanceof Error
          ? e.message
          : 'Could not load explore species. Run sql/explore_species_public_read.sql in Supabase if the table is new.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [stateName]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return { byType, isLoading, error, refetch: fetchAll };
}
