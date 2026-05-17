import { useCallback, useMemo } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import type { ExploreSpeciesByType } from '@/lib/explore/exploreSpeciesCategory';
import { EXPLORE_SPECIES_LOAD_ERROR_FALLBACK } from '@/lib/explore/discoverSetupHint';
import { partitionExploreSpeciesByType } from '@/lib/explore/partitionExploreSpeciesByType';
import { fetchExploreSpeciesForState } from '@/services/exploreService';

const emptyByType = (): ExploreSpeciesByType => ({
  animals: [],
  plants: [],
});

export function useExploreSpecies(stateName: string | null) {
  const enabled = Boolean(stateName?.trim());
  const fetcher = useCallback(async () => {
    const rows = await fetchExploreSpeciesForState(stateName!.trim());
    return partitionExploreSpeciesByType(rows);
  }, [stateName]);

  const options = useMemo(
    () => ({
      enabled,
      emptyValue: emptyByType(),
      initialLoading: true as const,
      fetcher,
      onError: (e: unknown) => (e instanceof Error ? e.message : EXPLORE_SPECIES_LOAD_ERROR_FALLBACK),
    }),
    [enabled, fetcher],
  );

  const { data, isLoading, error, refetch } = useAsyncResource<ExploreSpeciesByType>(options);

  return { byType: data, isLoading, error, refetch };
}
