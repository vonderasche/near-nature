import { useCallback, useEffect, useRef, useState } from 'react';

import {
  galleryItemsPlaceholderFromRows,
  hydrateGalleryItemsFromRows,
} from '@/lib/detections/hydrateGalleryItems';
import {
  invalidateCachedGalleryList,
  loadCachedGalleryList,
  saveCachedGalleryList,
} from '@/lib/detections/galleryListCache';
import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';
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
};

type LoadMode = 'reset' | 'append';

type UseUserDetectionGalleryResult = {
  items: DetectionGalleryItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  /** Background refresh after showing device cache. */
  isRefreshing: boolean;
  hasMore: boolean;
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
}: UseUserDetectionGalleryOptions = {}): UseUserDetectionGalleryResult {
  const [items, setItems] = useState<DetectionGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const rowsRef = useRef<DetectionGalleryRow[]>([]);
  const hadCacheRef = useRef(false);

  const persistCache = useCallback(
    async (rows: readonly DetectionGalleryRow[], more: boolean) => {
      if (!userId) return;
      await saveCachedGalleryList(userId, publicOnly, { rows, hasMore: more });
    },
    [publicOnly, userId],
  );

  const applyHydratedRows = useCallback(async (rows: readonly DetectionGalleryRow[]) => {
    const hydrated = await hydrateGalleryItemsFromRows(rows);
    setItems(hydrated);
  }, []);

  const loadPage = useCallback(
    async (mode: LoadMode, options?: { force?: boolean }) => {
      if (!userId) {
        offsetRef.current = 0;
        rowsRef.current = [];
        setItems([]);
        setHasMore(false);
        setError(null);
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
        hadCacheRef.current = false;
        return;
      }

      const force = options?.force ?? false;
      const offset = mode === 'reset' ? 0 : offsetRef.current;
      let showedCache = false;

      if (mode === 'reset' && !force) {
        const cached = await loadCachedGalleryList(userId, publicOnly);
        if (cached && cached.rows.length > 0) {
          rowsRef.current = cached.rows;
          offsetRef.current = cached.rows.length;
          setHasMore(cached.hasMore);
          setItems(galleryItemsPlaceholderFromRows(cached.rows));
          setIsLoading(false);
          setIsRefreshing(true);
          showedCache = true;
          hadCacheRef.current = true;
          void applyHydratedRows(cached.rows);
        }
      }

      if (mode === 'reset' && !showedCache) {
        setIsLoading(true);
      } else if (mode === 'append') {
        setIsLoadingMore(true);
      }

      setError(null);

      try {
        const requestSize =
          mode === 'append' ? pageSize : Math.max(pageSize, rowsRef.current.length);

        const { rows: pageRows, hasMore: more } = await fetchUserDetectionGalleryRowsPage({
          userId,
          publicOnly,
          offset,
          pageSize: requestSize,
        });

        const allRows =
          mode === 'reset'
            ? mergeRows('reset', [], pageRows)
            : mergeRows('append', rowsRef.current, pageRows);
        rowsRef.current = allRows;
        offsetRef.current = allRows.length;
        setHasMore(more);

        const hydrated = await hydrateGalleryItemsFromRows(allRows);
        setItems(hydrated);
        await persistCache(allRows, more);
      } catch (e) {
        if (!showedCache && !hadCacheRef.current) {
          setItems([]);
          setHasMore(false);
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
    [applyHydratedRows, pageSize, persistCache, publicOnly, userId],
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

  return {
    items,
    isLoading,
    isLoadingMore,
    isRefreshing,
    hasMore,
    error,
    loadMore,
    refetch,
  };
}
