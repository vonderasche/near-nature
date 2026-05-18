import { useCallback, useEffect, useRef, useState } from 'react';

import {
  loadCachedScoringSnapshot,
  saveCachedScoringSnapshot,
} from '@/lib/profile/scoringSnapshotCache';
import {
  fetchUserScoringSnapshot,
  type UserScoringSnapshot,
} from '@/services/scoringSnapshotService';

export function useUserScoringSnapshot(userId: string | undefined) {
  const [snapshot, setSnapshot] = useState<UserScoringSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hadCacheRef = useRef(false);

  const refetch = useCallback(
    async (options?: { force?: boolean }) => {
      if (!userId) {
        setSnapshot(null);
        setError(null);
        setLoading(false);
        setRefreshing(false);
        hadCacheRef.current = false;
        return;
      }

      const force = options?.force ?? false;
      let showedCache = false;

      if (!force) {
        const cached = await loadCachedScoringSnapshot(userId);
        if (cached) {
          setSnapshot(cached);
          hadCacheRef.current = true;
          showedCache = true;
          setLoading(false);
          setRefreshing(true);
        } else {
          setLoading(true);
        }
      } else {
        setRefreshing(true);
      }

      setError(null);

      try {
        const fresh = await fetchUserScoringSnapshot(userId);
        setSnapshot(fresh);
        await saveCachedScoringSnapshot(userId, fresh);
      } catch (e) {
        if (!showedCache && !hadCacheRef.current) {
          setSnapshot(null);
        }
        setError(e instanceof Error ? e.message : 'Could not load scoring data.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    hadCacheRef.current = false;
    void refetch();
  }, [refetch]);

  return {
    snapshot,
    loading,
    refreshing,
    error,
    refetch: () => refetch({ force: true }),
  };
}
