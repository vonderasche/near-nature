import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchPublicUserAwards } from '@/services/publicUserAwardsService';

export function usePublicUserAwards(userId: string | undefined) {
  const [awardKeys, setAwardKeys] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!userId) {
      setAwardKeys(new Set());
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rows = await fetchPublicUserAwards(userId);
      setAwardKeys(new Set(rows.map((r) => r.awardKey).filter(Boolean)));
    } catch (e) {
      setAwardKeys(new Set());
      setError(e instanceof Error ? e.message : 'Could not load badges.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const earnedCount = useMemo(() => awardKeys.size, [awardKeys]);

  return { awardKeys, earnedCount, loading, error, refetch };
}
