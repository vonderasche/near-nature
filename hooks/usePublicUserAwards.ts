import { useCallback, useEffect, useMemo, useState } from 'react';

import type { BadgeProgress } from '@/lib/profile/categoryProgressTypes';
import { fetchPublicUserAwards } from '@/services/publicUserAwardsService';

export function usePublicUserAwards(userId: string | undefined) {
  const [awardKeys, setAwardKeys] = useState<Set<string>>(() => new Set());
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!userId) {
      setAwardKeys(new Set());
      setBadgeProgress([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rows = await fetchPublicUserAwards(userId);
      setAwardKeys(new Set(rows.map((r) => r.awardKey).filter(Boolean)));
      setBadgeProgress(rows.map((r) => r.progress).filter((p): p is BadgeProgress => p != null));
    } catch (e) {
      setAwardKeys(new Set());
      setBadgeProgress([]);
      setError(e instanceof Error ? e.message : 'Could not load badges.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const earnedCount = useMemo(() => awardKeys.size, [awardKeys]);

  return { awardKeys, badgeProgress, earnedCount, loading, error, refetch };
}
