import { useCallback, useEffect } from 'react';

import { useCacheFirstFetch } from '@/hooks/useCacheFirstFetch';
import { subscribeProfileRefresh } from '@/lib/profile/profileRefresh';
import {
  loadCachedScoringSnapshotEntry,
  saveCachedScoringSnapshot,
} from '@/lib/profile/scoringSnapshotCache';
import {
  fetchUserScoringSnapshot,
  type UserScoringSnapshot,
} from '@/services/scoringSnapshotService';

export function useUserScoringSnapshot(userId: string | undefined) {
  const {
    data: snapshot,
    loading,
    refreshing,
    error,
    refetch,
  } = useCacheFirstFetch<UserScoringSnapshot>({
    enabled: Boolean(userId),
    loadCache: () =>
      userId ? loadCachedScoringSnapshotEntry(userId) : Promise.resolve(null),
    fetchFresh: () => fetchUserScoringSnapshot(userId!),
    saveCache: (fresh) => saveCachedScoringSnapshot(userId!, fresh),
    mapError: (e) => (e instanceof Error ? e.message : 'Could not load scoring data.'),
  });

  const forceRefetch = useCallback(() => refetch({ force: true }), [refetch]);

  useEffect(() => {
    return subscribeProfileRefresh(() => {
      void refetch({ force: true });
    });
  }, [refetch]);

  return {
    snapshot,
    loading,
    refreshing,
    error,
    refetch: forceRefetch,
  };
}
