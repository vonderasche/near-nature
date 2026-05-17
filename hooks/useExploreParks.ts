import { useCallback, useMemo } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import type { ExplorePark } from '@/lib/explore/exploreParkTypes';
import { EXPLORE_PARKS_LOAD_ERROR_FALLBACK } from '@/lib/explore/discoverSetupHint';
import { fetchParksForState } from '@/services/exploreService';

export function useExploreParks(stateName: string | null) {
  const enabled = Boolean(stateName?.trim());
  const fetcher = useCallback(async () => fetchParksForState(stateName!.trim()), [stateName]);

  const options = useMemo(
    () => ({
      enabled,
      emptyValue: [] as ExplorePark[],
      initialLoading: false as const,
      clearErrorWhenDisabled: true,
      fetcher,
      onError: (e: unknown) => (e instanceof Error ? e.message : EXPLORE_PARKS_LOAD_ERROR_FALLBACK),
    }),
    [enabled, fetcher],
  );

  const { data, isLoading, error, refetch } = useAsyncResource<ExplorePark[]>(options);

  return { parks: data, isLoading, error, refetch };
}
