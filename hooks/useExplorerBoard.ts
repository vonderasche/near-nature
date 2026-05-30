import { useCallback, useEffect, useRef, useState } from 'react';

import {
  loadCachedExplorerBoardList,
  saveCachedExplorerBoardList,
} from '@/lib/explorerBoard/explorerBoardListCache';
import { subscribeExplorerBoardRefresh } from '@/lib/explorerBoard/explorerBoardRefresh';
import {
  clearLegacyExplorerBoardCache,
  EXPLORER_BOARD_PAGE_SIZE,
  fetchExplorerBoardPage,
  type ExplorerBoardMemberRow,
} from '@/services/explorerBoardService';

export type { ExplorerBoardMemberRow };

function rpcFailureMessage(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const m = (e as { message: unknown }).message;
    if (typeof m === 'string' && m.trim().length > 0) return m;
  }
  return 'Could not load Explorer Board. In Supabase → SQL Editor, run sql/get_detection_count_leaderboard.sql (paginated RPC), then pull to refresh.';
}

export function useExplorerBoard(pageSize = EXPLORER_BOARD_PAGE_SIZE): {
  rows: ExplorerBoardMemberRow[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
} {
  const [rows, setRows] = useState<ExplorerBoardMemberRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const hasFetchedOnceRef = useRef(false);
  const hadCacheRef = useRef(false);

  const loadPage = useCallback(
    async (mode: 'reset' | 'append') => {
      if (mode === 'reset') {
        clearLegacyExplorerBoardCache();
        hadCacheRef.current = false;
      }

      const offset = mode === 'reset' ? 0 : offsetRef.current;
      const isInitial = mode === 'reset' && !hasFetchedOnceRef.current;

      setError(null);
      if (mode === 'reset') {
        if (isInitial) {
          const cached = await loadCachedExplorerBoardList();
          if (cached && cached.rows.length > 0) {
            setRows(cached.rows);
            setHasMore(cached.hasMore);
            offsetRef.current = cached.rows.length;
            hadCacheRef.current = true;
            setIsLoading(false);
            setIsRefreshing(true);
          } else {
            setIsLoading(true);
          }
        } else {
          setIsRefreshing(true);
        }
      } else {
        setIsLoadingMore(true);
      }

      try {
        const { rows: pageRows, hasMore: more } = await fetchExplorerBoardPage({
          offset,
          pageSize,
        });

        offsetRef.current = offset + pageRows.length;
        setHasMore(more);
        setRows((prev) => (mode === 'reset' ? pageRows : [...prev, ...pageRows]));
        hasFetchedOnceRef.current = true;

        if (mode === 'reset' && offset === 0) {
          await saveCachedExplorerBoardList({ rows: pageRows, hasMore: more });
        }
      } catch (e) {
        if (mode === 'reset' && !hadCacheRef.current) {
          setRows([]);
          setHasMore(false);
        }
        setError(rpcFailureMessage(e));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [pageSize],
  );

  const refetch = useCallback(async () => {
    await loadPage('reset');
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading || isRefreshing) return;
    await loadPage('append');
  }, [hasMore, isLoadingMore, isLoading, isRefreshing, loadPage]);

  useEffect(() => {
    hasFetchedOnceRef.current = false;
    offsetRef.current = 0;
    void loadPage('reset');
  }, [loadPage]);

  useEffect(() => {
    return subscribeExplorerBoardRefresh(() => {
      void loadPage('reset');
    });
  }, [loadPage]);

  return { rows, isLoading, isRefreshing, isLoadingMore, hasMore, error, loadMore, refetch };
}
