import { useCallback, useEffect, useRef, useState } from 'react';

import { buildOwnerGalleryDisplayItems } from '@/lib/detections/mergeGalleryDisplayItems';
import {
  galleryItemsPlaceholderFromRows,
  hydrateGalleryItemsFromRows,
} from '@/lib/detections/hydrateGalleryItems';
import type { GalleryCategoryFilter } from '@/lib/detections/filterDetectionGalleryItems';
import { DEFAULT_CACHE_MAX_AGE_MS } from '@/constants/cache-ttl';
import { isCacheEntryFresh } from '@/lib/cache/isCacheEntryFresh';
import {
  invalidateCachedGalleryList,
  loadCachedGalleryList,
  saveCachedGalleryList,
} from '@/lib/detections/galleryListCache';
import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';
import {
  getPendingGalleryItems,
  mergePendingAndServerGalleryItems,
  subscribePendingGalleryDetection,
} from '@/lib/detections/pendingGalleryDetection';
import { subscribeProfileRefresh } from '@/lib/profile/profileRefresh';
import { isSearchQueryActive } from '@/lib/search/normalizeSearchQuery';
import {
  fetchUserDetectionGalleryRowsPage,
  GALLERY_PAGE_SIZE,
} from '@/services/detectionGalleryService';
import type { DetectionGalleryItem } from '@/types';

type UseUserDetectionGalleryOptions = {
  userId?: string;
  pageSize?: number;
  /** When true, only non-sensitive rows (public gallery / other users). */
  publicOnly?: boolean;
  /** Debounced text query; server search when active. */
  searchQuery?: string;
  /** Taxon filter; applied in SQL when RPC is available. */
  categoryFilter?: GalleryCategoryFilter;
};

type LoadMode = 'reset' | 'append';

type UseUserDetectionGalleryResult = {
  items: DetectionGalleryItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  /** Background refresh after showing device cache. */
  isRefreshing: boolean;
  hasMore: boolean;
  /** Total rows matching search/filter (from RPC `total_count`). */
  totalCount: number | null;
  error: string | null;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
};

function mergeRows(
  mode: LoadMode,
  previous: readonly DetectionGalleryRow[],
  pageRows: readonly DetectionGalleryRow[],
): DetectionGalleryRow[] {
  const combined = mode === 'reset' ? [...pageRows] : [...previous, ...pageRows];
  const seen = new Set<string>();
  const out: DetectionGalleryRow[] = [];
  for (const row of combined) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

export function useUserDetectionGallery({
  userId,
  pageSize = GALLERY_PAGE_SIZE,
  publicOnly = false,
  searchQuery = '',
  categoryFilter = { kind: 'all' },
}: UseUserDetectionGalleryOptions = {}): UseUserDetectionGalleryResult {
  const [items, setItems] = useState<DetectionGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const rowsRef = useRef<DetectionGalleryRow[]>([]);
  const hadCacheRef = useRef(false);

  const showOptimisticPending =
    Boolean(userId) && !publicOnly && !isSearchQueryActive(searchQuery) && categoryFilter.kind === 'all';

  const persistCache = useCallback(
    async (rows: readonly DetectionGalleryRow[], more: boolean) => {
      if (!userId) return;
      await saveCachedGalleryList(userId, publicOnly, { rows, hasMore: more });
    },
    [publicOnly, userId],
  );

  const applyDisplayItems = useCallback(
    async (serverRows: readonly DetectionGalleryRow[]) => {
      if (!userId) {
        setItems([]);
        return;
      }
      if (showOptimisticPending) {
        setItems(await buildOwnerGalleryDisplayItems(userId, serverRows));
        return;
      }
      const hydrated = await hydrateGalleryItemsFromRows(serverRows);
      setItems(hydrated);
    },
    [showOptimisticPending, userId],
  );

  const loadPage = useCallback(
    async (mode: LoadMode, options?: { force?: boolean }) => {
      if (!userId) {
        offsetRef.current = 0;
        rowsRef.current = [];
        setItems([]);
        setHasMore(false);
        setTotalCount(null);
        setError(null);
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
        hadCacheRef.current = false;
        return;
      }

      const force = options?.force ?? false;
      const offset = mode === 'reset' ? 0 : offsetRef.current;
      const queryActive = isSearchQueryActive(searchQuery);
      const filterActive = categoryFilter.kind !== 'all';
      let showedCache = false;
      let skipNetwork = false;

      if (mode === 'reset' && !force && !queryActive && !filterActive) {
        const cached = await loadCachedGalleryList(userId, publicOnly);
        if (cached && cached.rows.length > 0) {
          rowsRef.current = cached.rows;
          offsetRef.current = cached.rows.length;
          setHasMore(cached.hasMore);
          setTotalCount(null);
          if (showOptimisticPending) {
            const pending = getPendingGalleryItems(userId);
            const placeholders = galleryItemsPlaceholderFromRows(cached.rows);
            setItems(mergePendingAndServerGalleryItems(pending, placeholders));
          } else {
            setItems(galleryItemsPlaceholderFromRows(cached.rows));
          }
          setIsLoading(false);
          const fresh = isCacheEntryFresh(cached.cachedAt, DEFAULT_CACHE_MAX_AGE_MS);
          setIsRefreshing(!fresh);
          showedCache = true;
          hadCacheRef.current = true;
          void applyDisplayItems(cached.rows);
          skipNetwork = fresh;
        } else if (showOptimisticPending) {
          const pending = getPendingGalleryItems(userId);
          if (pending.length > 0) {
            setItems(pending);
            setIsLoading(false);
            setIsRefreshing(true);
            showedCache = true;
          }
        }
      }

      if (mode === 'reset' && !showedCache) {
        setIsLoading(true);
      } else if (mode === 'append') {
        setIsLoadingMore(true);
      }

      setError(null);

      if (skipNetwork) {
        return;
      }

      try {
        const requestSize =
          mode === 'append' || queryActive || filterActive
            ? pageSize
            : Math.max(pageSize, rowsRef.current.length);

        const { rows: pageRows, hasMore: more, totalCount: total } =
          await fetchUserDetectionGalleryRowsPage({
            userId,
            query: searchQuery,
            publicOnly,
            offset,
            pageSize: requestSize,
            categoryFilter,
          });

        const allRows =
          mode === 'reset'
            ? mergeRows('reset', [], pageRows)
            : mergeRows('append', rowsRef.current, pageRows);
        rowsRef.current = allRows;
        offsetRef.current = allRows.length;
        setHasMore(more);
        setTotalCount(total);

        await applyDisplayItems(allRows);
        if (!queryActive && !filterActive) {
          await persistCache(allRows, more);
        }
      } catch (e) {
        if (!showedCache && !hadCacheRef.current) {
          setItems(showOptimisticPending ? getPendingGalleryItems(userId) : []);
          setHasMore(false);
          setTotalCount(null);
          rowsRef.current = [];
          offsetRef.current = 0;
        }
        setError(e instanceof Error ? e.message : 'Failed to load gallery.');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    },
    [
      applyDisplayItems,
      categoryFilter,
      pageSize,
      persistCache,
      publicOnly,
      searchQuery,
      showOptimisticPending,
      userId,
    ],
  );

  const refetch = useCallback(async () => {
    if (userId) {
      await invalidateCachedGalleryList(userId, publicOnly);
    }
    rowsRef.current = [];
    offsetRef.current = 0;
    hadCacheRef.current = false;
    await loadPage('reset', { force: true });
  }, [loadPage, publicOnly, userId]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    await loadPage('append');
  }, [hasMore, isLoadingMore, isLoading, loadPage]);

  useEffect(() => {
    hadCacheRef.current = false;
    rowsRef.current = [];
    offsetRef.current = 0;
    void loadPage('reset');
  }, [loadPage]);

  useEffect(() => {
    if (!userId) return;
    return subscribeProfileRefresh(() => {
      void refetch();
    });
  }, [refetch, userId]);

  useEffect(() => {
    if (!showOptimisticPending || !userId) return;
    return subscribePendingGalleryDetection(() => {
      void (async () => {
        const cached = await loadCachedGalleryList(userId, publicOnly);
        if (cached && cached.rows.length > 0) {
          rowsRef.current = cached.rows;
          offsetRef.current = cached.rows.length;
          setHasMore(cached.hasMore);
          await applyDisplayItems(cached.rows);
          return;
        }
        await applyDisplayItems(rowsRef.current);
      })();
    });
  }, [applyDisplayItems, publicOnly, showOptimisticPending, userId]);

  return {
    items,
    isLoading,
    isLoadingMore,
    isRefreshing,
    hasMore,
    totalCount,
    error,
    loadMore,
    refetch,
  };
}
