import { useCallback, useMemo } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import type { ExplorePark, ParkSpeciesRow } from '@/lib/explore/exploreParkTypes';
import { fetchParkById, fetchParkSpecies } from '@/services/exploreService';

type ParkDetailData = {
  park: ExplorePark | null;
  species: ParkSpeciesRow[];
};

const emptyDetail = (): ParkDetailData => ({ park: null, species: [] });

export function useExploreParkDetail(parkId: string | undefined) {
  const enabled = Boolean(parkId?.trim());

  const fetcher = useCallback(async () => {
    const id = parkId!.trim();
    const [park, species] = await Promise.all([fetchParkById(id), fetchParkSpecies(id)]);
    return { park, species };
  }, [parkId]);

  const options = useMemo(
    () => ({
      enabled,
      emptyValue: emptyDetail(),
      initialLoading: true as const,
      fetcher,
      onError: (e: unknown) => (e instanceof Error ? e.message : 'Could not load park.'),
    }),
    [enabled, fetcher],
  );

  const { data, isLoading, error, refetch } = useAsyncResource<ParkDetailData>(options);

  return {
    park: data.park,
    species: data.species,
    isLoading,
    error,
    refetch,
  };
}
