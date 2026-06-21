import { useCallback, useEffect, useState } from 'react';

import { fetchDetectionGalleryItemById } from '@/services/detectionGalleryService';
import { getStagedGalleryItem, stageGalleryItem } from '@/lib/gallery/galleryItemRouteCache';
import type { DetectionGalleryItem } from '@/types';

export type UseDetectionDetailOptions = {
  /** When set, only return the row if it belongs to this user. */
  userId?: string;
  /** When true, omit sensitive rows (public member galleries). */
  publicOnly?: boolean;
};

export type UseDetectionDetailResult = {
  item: DetectionGalleryItem | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useDetectionDetail(
  detectionId: string | undefined,
  options: UseDetectionDetailOptions = {},
): UseDetectionDetailResult {
  const { userId, publicOnly = false } = options;
  const staged = detectionId ? getStagedGalleryItem(detectionId) : undefined;
  const [item, setItem] = useState<DetectionGalleryItem | undefined>(staged);
  const [isLoading, setIsLoading] = useState(Boolean(detectionId) && !staged);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!detectionId) {
      setItem(undefined);
      setIsLoading(false);
      setError(null);
      return;
    }

    const cached = getStagedGalleryItem(detectionId);
    if (cached) {
      setItem(cached);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const fetched = await fetchDetectionGalleryItemById(detectionId, { userId, publicOnly });
      if (!fetched) {
        setItem(undefined);
        setError('This identification is no longer available.');
        return;
      }
      stageGalleryItem(fetched);
      setItem(fetched);
    } catch (e) {
      setItem(undefined);
      setError(e instanceof Error ? e.message : 'Could not load identification.');
    } finally {
      setIsLoading(false);
    }
  }, [detectionId, publicOnly, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { item, isLoading, error, refetch: load };
}
