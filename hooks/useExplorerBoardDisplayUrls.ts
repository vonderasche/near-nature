import { useCallback, useEffect, useMemo, useState } from 'react';

import { collectExplorerBoardImageStoredUrls } from '@/lib/explorerBoard/collectExplorerBoardImageStoredUrls';
import type { ExplorerBoardMemberRow } from '@/services/explorerBoardService';
import { getDetectionImageDisplayUrlMap } from '@/services/detectionImageUrl';

export function useExplorerBoardDisplayUrls(rows: readonly ExplorerBoardMemberRow[]) {
  const [displayUrlByStored, setDisplayUrlByStored] = useState<Map<string, string>>(() => new Map());

  const storedUrls = useMemo(() => collectExplorerBoardImageStoredUrls(rows), [rows]);
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
