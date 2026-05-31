import { useCallback, useEffect, useRef, useState } from 'react';

import { isSearchQueryActive } from '@/lib/search/normalizeSearchQuery';
import {
  fetchPublicDetectionExplorePage,
  PUBLIC_EXPLORE_PAGE_SIZE,
} from '@/services/publicDetectionExploreService';
import type { DetectionGalleryItem } from '@/types';

function exploreFailureMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string' && message.trim().length > 0) return message;
  }
  return 'Could not search community identifications. In Supabase → SQL Editor, run sql/search_public_detections.sql (and sql/add_detection_search.sql if needed), then try again.';
}

export function usePublicDetectionExplore(
  searchQuery: string,
  pageSize = PUBLIC_EXPLORE_PAGE_SIZE,
): {
  items: DetectionGalleryItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  totalCount: number | null;
  error: string | null;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
} {
  const [items, setItems] = useState<DetectionGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const queryRef = useRef(searchQuery);

  const loadPage = useCallback(
    async (mode: 'reset' | 'append') => {
      const activeQuery = queryRef.current;
      if (!isSearchQueryActive(activeQuery)) {
        setItems([]);
        setHasMore(false);
        setTotalCount(null);
        setError(null);
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      const offset = mode === 'reset' ? 0 : offsetRef.current;
      if (mode === 'reset') {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const result = await fetchPublicDetectionExplorePage({
          query: activeQuery,
          offset,
          pageSize,
        });
        offsetRef.current = offset + result.items.length;
        setHasMore(result.hasMore);
        setTotalCount(result.totalCount);
        setItems((previous) =>
          mode === 'reset' ? result.items : [...previous, ...result.items],
        );
      } catch (e) {
        if (mode === 'reset') {
          setItems([]);
          setHasMore(false);
          setTotalCount(null);
        }
        setError(exploreFailureMessage(e));
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [pageSize],
  );

  const refetch = useCallback(async () => {
    offsetRef.current = 0;
    await loadPage('reset');
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    await loadPage('append');
  }, [hasMore, isLoading, isLoadingMore, loadPage]);

  useEffect(() => {
    queryRef.current = searchQuery;
    offsetRef.current = 0;
    void loadPage('reset');
  }, [loadPage, searchQuery]);

  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    error,
    loadMore,
    refetch,
  };
}
