import { useCallback, useEffect, useMemo, useState } from 'react';

import { collectLeaderboardImageStoredUrls } from '@/lib/leaderboard/collectLeaderboardImageStoredUrls';
import type { DetectionLeaderboardRow } from '@/services/leaderboardService';
import { getDetectionImageDisplayUrlMap } from '@/services/detectionImageUrl';

export function useExplorerBoardDisplayUrls(rows: readonly DetectionLeaderboardRow[]) {
  const [displayUrlByStored, setDisplayUrlByStored] = useState<Map<string, string>>(() => new Map());

  const storedUrls = useMemo(() => collectLeaderboardImageStoredUrls(rows), [rows]);
  const storedUrlsKey = useMemo(() => storedUrls.join('\u0001'), [storedUrls]);

  useEffect(() => {
    if (storedUrls.length === 0) {
      setDisplayUrlByStored(new Map());
      return;
    }

    let cancelled = false;

    void getDetectionImageDisplayUrlMap(storedUrls).then((map) => {
      if (!cancelled) setDisplayUrlByStored(map);
    });

    return () => {
      cancelled = true;
    };
  }, [storedUrls, storedUrlsKey]);

  const resolveDisplayUrl = useCallback(
    (storedUrl: string | null | undefined): string | null => {
      const trimmed = storedUrl?.trim();
      if (!trimmed) return null;
      return displayUrlByStored.get(trimmed) ?? null;
    },
    [displayUrlByStored],
  );

  return { resolveDisplayUrl };
}
