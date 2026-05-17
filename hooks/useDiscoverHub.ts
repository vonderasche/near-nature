import { useCallback, useMemo } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import type { ExploreParkSummary } from '@/lib/explore/exploreParkTypes';
import type { ExploreSpecies } from '@/lib/explore/exploreSpeciesTypes';
import { DISCOVER_LOAD_ERROR_FALLBACK } from '@/lib/explore/discoverSetupHint';
import { fetchExploreParkSummary, fetchFeaturedSpecies } from '@/services/exploreService';

type HubData = {
  featured: ExploreSpecies[];
  parkSummary: ExploreParkSummary | null;
};

const emptyHub = (): HubData => ({ featured: [], parkSummary: null });

export function useDiscoverHub(stateName: string | null) {
  const enabled = Boolean(stateName?.trim());
  const fetcher = useCallback(async () => {
    const state = stateName!.trim();
    const [featured, parkSummary] = await Promise.all([
      fetchFeaturedSpecies(),
      fetchExploreParkSummary(state),
    ]);
    return { featured, parkSummary };
  }, [stateName]);

  const options = useMemo(
    () => ({
      enabled,
      emptyValue: emptyHub(),
      initialLoading: false as const,
      fetcher,
      onError: (e: unknown) => (e instanceof Error ? e.message : DISCOVER_LOAD_ERROR_FALLBACK),
    }),
    [enabled, fetcher],
  );

  const { data, isLoading, error, refetch } = useAsyncResource<HubData>(options);

  return {
    featured: data.featured,
    parkSummary: data.parkSummary,
    isLoading,
    error,
    refetch,
  };
}
