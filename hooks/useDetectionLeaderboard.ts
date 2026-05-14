import { useCallback, useEffect, useRef, useState } from 'react';

import { supabase } from '@/lib/supabase';

export type DetectionLeaderboardRow = {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  motto: string | null;
  detectionCount: number;
};

type RpcRow = {
  leaderboard_rank: number | string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  motto: string | null;
  detection_count: number | string;
};

function rpcFailureMessage(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const m = (e as { message: unknown }).message;
    if (typeof m === 'string' && m.trim().length > 0) return m;
  }
  return 'Could not load leaderboard. In Supabase → SQL Editor, run sql/get_detection_count_leaderboard.sql, then pull to refresh.';
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
      const { data, error: rpcError } = await supabase.rpc('get_detection_count_leaderboard');
      if (rpcError) throw rpcError;

      const list = (data ?? []) as RpcRow[];
      setRows(
        list.map((r) => ({
          rank: Number(r.leaderboard_rank),
          userId: r.user_id,
          username: r.username,
          avatarUrl: r.avatar_url && r.avatar_url.length > 0 ? r.avatar_url : null,
          motto: typeof r.motto === 'string' && r.motto.trim().length > 0 ? r.motto.trim() : null,
          detectionCount: Number(r.detection_count),
        })),
      );
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
