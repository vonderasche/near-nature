import { useCallback, useEffect, useState } from 'react';

import { getDetectionImageDisplayUrl } from '@/services/detectionImageUrl';
import { supabase } from '@/lib/supabase';
import type { DetectionGalleryItem } from '@/types';

type UseUserDetectionGalleryOptions = {
  userId?: string;
  limit?: number;
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
      const { data, error: queryError } = await supabase
        .from('detections')
        .select('id, image_url, detected_at, common_name, latin_name')
        .eq('user_id', userId)
        .order('detected_at', { ascending: false })
        .limit(limit);

      if (queryError) throw queryError;

      const rows = data ?? [];
      const mapped = await Promise.all(
        rows.map(async (row): Promise<DetectionGalleryItem> => {
          const imageUrl = row.image_url;
          const displayUrl = await getDetectionImageDisplayUrl(imageUrl);
          return {
            id: row.id,
            imageUrl,
            displayUrl,
            detectedAt: row.detected_at,
            commonName: row.common_name,
            latinName: row.latin_name,
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
  }, [userId, limit]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  return { items, isLoading, error, refetch: fetchItems };
}
