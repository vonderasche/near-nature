import { useCallback, useEffect, useRef, useState } from 'react';

import {
  fetchUserDetectionGalleryPage,
  GALLERY_PAGE_SIZE,
} from '@/services/detectionGalleryService';
import type { DetectionGalleryItem } from '@/types';

type UseUserDetectionGalleryOptions = {
  userId?: string;
  pageSize?: number;
  /** When true, only non-sensitive rows (public gallery / other users). */
  publicOnly?: boolean;
};

type UseUserDetectionGalleryResult = {
  items: DetectionGalleryItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
};

export function useUserDetectionGallery({
  userId,
  pageSize = GALLERY_PAGE_SIZE,
  publicOnly = false,
}: UseUserDetectionGalleryOptions = {}): UseUserDetectionGalleryResult {
  const [items, setItems] = useState<DetectionGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const hasFetchedOnceRef = useRef(false);

  const loadPage = useCallback(
    async (mode: 'reset' | 'append') => {
      if (!userId) {
        offsetRef.current = 0;
        setItems([]);
        setHasMore(false);
        setError(null);
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
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
        const { items: pageItems, hasMore: more } = await fetchUserDetectionGalleryPage({
          userId,
          publicOnly,
          offset,
          pageSize,
        });

        offsetRef.current = offset + pageItems.length;
        setHasMore(more);
        setItems((prev) => (mode === 'reset' ? pageItems : [...prev, ...pageItems]));
        hasFetchedOnceRef.current = true;
      } catch (e) {
        if (mode === 'reset') {
          setItems([]);
          setHasMore(false);
        }
        setError(e instanceof Error ? e.message : 'Failed to load gallery.');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [userId, pageSize, publicOnly],
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

  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
  };
}
