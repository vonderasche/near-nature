import { useCallback, useEffect, useState } from 'react';

import { getDetectionImageDisplayUrl } from '@/services/detectionImageUrl';
import { supabase } from '@/lib/supabase';
import type { DetectionGalleryItem } from '@/types';

type UseUserDetectionGalleryOptions = {
  userId?: string;
  limit?: number;
  /** When true, only non-sensitive rows (public gallery / other users). */
  publicOnly?: boolean;
};

type UseUserDetectionGalleryResult = {
  items: DetectionGalleryItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useUserDetectionGallery({
  userId,
  limit = 24,
  publicOnly = false,
}: UseUserDetectionGalleryOptions = {}): UseUserDetectionGalleryResult {
  const [items, setItems] = useState<DetectionGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let q = supabase
        .from('detections')
        .select('id, image_url, detected_at, common_name, latin_name, description')
        .eq('user_id', userId)
        .order('detected_at', { ascending: false })
        .limit(limit);
      if (publicOnly) {
        q = q.eq('is_sensitive', false);
      }
      const { data, error: queryError } = await q;

      if (queryError) throw queryError;

      const rows = data ?? [];
      const mapped = await Promise.all(
        rows.map(async (row): Promise<DetectionGalleryItem> => {
          const imageUrl = row.image_url;
          const displayUrl = await getDetectionImageDisplayUrl(imageUrl);
          const description =
            typeof row.description === 'string' && row.description.trim().length > 0
              ? row.description.trim()
              : null;

          return {
            id: row.id,
            imageUrl,
            displayUrl,
            detectedAt: row.detected_at,
            commonName: row.common_name,
            latinName: row.latin_name,
            description,
          };
        }),
      );

      setItems(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load gallery.');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, limit, publicOnly]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  return { items, isLoading, error, refetch: fetchItems };
}
