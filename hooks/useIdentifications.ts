import { useCallback, useEffect, useState } from 'react';

import { detectionCategoryMatchesTaxonGroup } from '@/lib/detections/detectionCategoryTaxonFilter';
import { hydrateGalleryItemsFromRows } from '@/lib/detections/hydrateGalleryItems';
import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';
import { supabase } from '@/lib/supabase';
import type { Identification, TaxonGroup } from '@/types';

interface UseIdentificationsOptions {
  userId?: string;
  taxonGroup?: TaxonGroup;
  limit?: number;
}

interface UseIdentificationsResult {
  identifications: Identification[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useIdentifications({
  userId,
  taxonGroup = 'all',
  limit = 50,
}: UseIdentificationsOptions = {}): UseIdentificationsResult {
  const [identifications, setIdentifications] = useState<Identification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) {
      setIdentifications([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('detections')
        .select(
          'id, user_id, image_url, detected_at, common_name, latin_name, category, subcategory, main_category, description, native_status',
        )
        .eq('user_id', userId)
        .order('detected_at', { ascending: false })
        .limit(limit);

      if (queryError) throw queryError;

      const rows = ((data ?? []) as DetectionGalleryRow[]).filter((row) =>
        detectionCategoryMatchesTaxonGroup(String(row.category), taxonGroup),
      );
      const galleryItems = await hydrateGalleryItemsFromRows(rows);

      const mapped: Identification[] = galleryItems.map((item) => ({
        id: item.id,
        userId,
        timestamp: item.detectedAt,
        species: {
          id: item.id,
          latinName: item.latinName,
          commonName: item.commonName,
          taxonGroup: item.category,
          status: item.nativeStatus,
        },
        galleryItem: item,
      }));

      setIdentifications(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load identifications.');
      setIdentifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, taxonGroup, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { identifications, isLoading, error, refetch: fetch };
}
