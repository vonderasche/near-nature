import { useCallback, useEffect, useState } from 'react';

import {
  fetchUserScoreByCategory,
  type UserScoreBreakdown,
} from '@/services/scoreBreakdownService';

export function useUserScoreBreakdown(userId: string | undefined) {
  const [breakdown, setBreakdown] = useState<UserScoreBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!userId) {
      setBreakdown(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setBreakdown(await fetchUserScoreByCategory(userId));
    } catch (e) {
      setBreakdown(null);
      setError(e instanceof Error ? e.message : 'Could not load score breakdown.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { breakdown, loading, error, refetch };
}
