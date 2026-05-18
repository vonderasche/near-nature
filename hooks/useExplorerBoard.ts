import { useCallback, useEffect, useRef, useState } from 'react';

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
  return 'Could not load Explorer board. In Supabase → SQL Editor, run sql/get_detection_count_leaderboard.sql (paginated RPC), then pull to refresh.';
}

export function useExplorerBoard(pageSize = EXPLORER_BOARD_PAGE_SIZE): {
  rows: ExplorerBoardMemberRow[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
} {
  const [rows, setRows] = useState<ExplorerBoardMemberRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const hasFetchedOnceRef = useRef(false);

  const loadPage = useCallback(
    async (mode: 'reset' | 'append') => {
      if (mode === 'reset') {
        clearLegacyExplorerBoardCache();
      }
      const offset = mode === 'reset' ? 0 : offsetRef.current;
      const isInitial = mode === 'reset' && !hasFetchedOnceRef.current;

      setError(null);
      if (mode === 'reset') {
        if (isInitial) setIsLoading(true);
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
      } catch (e) {
        if (mode === 'reset') {
          setRows([]);
          setHasMore(false);
        }
        setError(rpcFailureMessage(e));
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [pageSize],
  );

  const refetch = useCallback(async () => {
    await loadPage('reset');
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    await loadPage('append');
  }, [hasMore, isLoadingMore, isLoading, loadPage]);

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

  return { rows, isLoading, isLoadingMore, hasMore, error, loadMore, refetch };
}
