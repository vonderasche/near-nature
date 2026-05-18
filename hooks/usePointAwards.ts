import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export type PointAwardRow = {
  awardKey: string;
  points: number;
  label: string;
  awardedAt: string;
};

export function usePointAwards(userId: string | undefined) {
  const [awards, setAwards] = useState<PointAwardRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAwards = useCallback(async () => {
    if (!userId) {
      setAwards([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: qErr } = await supabase
        .from('point_awards')
        .select('award_key, points, label, awarded_at')
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false });
      if (qErr) throw qErr;
      setAwards(
        (data ?? []).map((row) => ({
          awardKey: String(row.award_key),
          points: Number(row.points),
          label: String(row.label),
          awardedAt: String(row.awarded_at),
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load awards.');
      setAwards([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchAwards();
  }, [fetchAwards]);

  const awardKeys = new Set(awards.map((a) => a.awardKey));

  return { awards, awardKeys, loading, error, refetch: fetchAwards };
}
