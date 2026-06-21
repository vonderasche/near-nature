import { useCallback, useEffect, useRef, useState } from 'react';

import { DEFAULT_CACHE_MAX_AGE_MS } from '@/constants/cache-ttl';
import { useLocalDatabaseReady } from '@/context/LocalDatabaseContext';
import { isCacheEntryFresh } from '@/lib/cache/isCacheEntryFresh';
import { shouldLoadExplorerBoardFromCache } from '@/lib/explorerBoard/explorerBoardCachePolicy';
import {
  loadCachedExplorerBoardList,
  saveCachedExplorerBoardList,
} from '@/lib/explorerBoard/explorerBoardListCache';
import { mergeExplorerBoardRows } from '@/lib/explorerBoard/mergeExplorerBoardRows';
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
  return 'Could not load Rankings. In Supabase → SQL Editor, run sql/get_detection_count_leaderboard.sql (paginated RPC), then pull to refresh.';
}

export function useExplorerBoard(pageSize = EXPLORER_BOARD_PAGE_SIZE): {
  rows: ExplorerBoardMemberRow[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refetch: (options?: { force?: boolean }) => Promise<void>;
} {
  const [rows, setRows] = useState<ExplorerBoardMemberRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const rowsRef = useRef<ExplorerBoardMemberRow[]>([]);
  const hasFetchedOnceRef = useRef(false);
  const hadCacheRef = useRef(false);
  const { ready: dbReady, supported: dbSupported } = useLocalDatabaseReady();

  const persistRows = useCallback(async (merged: ExplorerBoardMemberRow[], more: boolean) => {
    rowsRef.current = merged;
    await saveCachedExplorerBoardList({ rows: merged, hasMore: more });
  }, []);

  const loadPage = useCallback(
    async (mode: 'reset' | 'append', options?: { force?: boolean }) => {
      const force = options?.force ?? false;

      if (mode === 'reset') {
        clearLegacyExplorerBoardCache();
        hadCacheRef.current = false;
        if (force) {
          rowsRef.current = [];
        }
      }

      const offset = mode === 'reset' ? 0 : offsetRef.current;
      const isInitial = mode === 'reset' && !hasFetchedOnceRef.current;

      setError(null);
      let skipNetwork = false;

      if (
        shouldLoadExplorerBoardFromCache({
          mode,
          force,
          isInitial,
        })
      ) {
        const cached = await loadCachedExplorerBoardList();
        if (cached && cached.rows.length > 0) {
          rowsRef.current = cached.rows;
          setRows(cached.rows);
          setHasMore(cached.hasMore);
          offsetRef.current = cached.rows.length;
          hadCacheRef.current = true;
          setIsLoading(false);
          const fresh = isCacheEntryFresh(cached.cachedAt, DEFAULT_CACHE_MAX_AGE_MS);
          setIsRefreshing(!fresh);
          hasFetchedOnceRef.current = fresh;
          skipNetwork = fresh;
        } else {
          setIsLoading(true);
        }
      } else if (mode === 'reset') {
        if (!hadCacheRef.current) {
          setIsLoading(true);
        }
        setIsRefreshing(true);
      } else {
        setIsLoadingMore(true);
      }

      if (skipNetwork) {
        return;
      }

      try {
        const { rows: pageRows, hasMore: more } = await fetchExplorerBoardPage({
          offset,
          pageSize,
        });

        const merged =
          mode === 'reset' ? pageRows : mergeExplorerBoardRows(rowsRef.current, pageRows);

        offsetRef.current = offset + pageRows.length;
        setHasMore(more);
        setRows(merged);
        hasFetchedOnceRef.current = true;
        await persistRows(merged, more);
      } catch (e) {
        if (mode === 'reset' && !hadCacheRef.current) {
          rowsRef.current = [];
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
    [pageSize, persistRows],
  );

  const refetch = useCallback(async (options?: { force?: boolean }) => {
    hasFetchedOnceRef.current = false;
    offsetRef.current = 0;
    await loadPage('reset', { force: options?.force ?? true });
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading || isRefreshing) return;
    await loadPage('append');
  }, [hasMore, isLoadingMore, isLoading, isRefreshing, loadPage]);

  useEffect(() => {
    if (dbSupported && !dbReady) return;
    void loadPage('reset');
  }, [dbReady, dbSupported, loadPage]);

  useEffect(() => {
    return subscribeExplorerBoardRefresh(() => {
      void refetch({ force: true });
    });
  }, [refetch]);

  return { rows, isLoading, isRefreshing, isLoadingMore, hasMore, error, loadMore, refetch };
}
