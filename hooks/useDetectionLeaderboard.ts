import { useCallback, useEffect, useRef, useState } from 'react';

import { getDetectionCountLeaderboard, type DetectionLeaderboardRow } from '@/services/leaderboardService';

export type { DetectionLeaderboardRow };

function rpcFailureMessage(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const m = (e as { message: unknown }).message;
    if (typeof m === 'string' && m.trim().length > 0) return m;
  }
  return 'Could not load leaderboard. In the Supabase SQL Editor, run sql/get_detection_count_leaderboard.sql, then pull to refresh.';
}

export function useDetectionLeaderboard(): {
  rows: DetectionLeaderboardRow[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [rows, setRows] = useState<DetectionLeaderboardRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedOnceRef = useRef(false);

  const fetchRows = useCallback(async () => {
    setError(null);
    if (!hasFetchedOnceRef.current) {
      setIsLoading(true);
    }
    try {
      setRows(await getDetectionCountLeaderboard());
      hasFetchedOnceRef.current = true;
    } catch (e) {
      setRows([]);
      setError(rpcFailureMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  return { rows, isLoading, error, refetch: fetchRows };
}
