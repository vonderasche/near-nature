import { useCallback, useEffect, useState } from 'react';

import { detectionCategoryMatchesTaxonGroup } from '@/lib/detections/detectionCategoryTaxonFilter';
import { mapGalleryItemsToIdentifications } from '@/lib/detections/mapGalleryItemsToIdentifications';
import { hydrateGalleryItemsFromRows } from '@/lib/detections/hydrateGalleryItems';
import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';
import { fetchUserDetectionGalleryRowsPage } from '@/services/detectionGalleryService';
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
  refetch: () => Promise<void>;
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
      const { rows: pageRows } = await fetchUserDetectionGalleryRowsPage({
        userId,
        publicOnly: false,
        offset: 0,
        pageSize: limit,
        query: '',
        categoryFilter: { kind: 'all' },
      });

      const rows = (pageRows as DetectionGalleryRow[]).filter((row) =>
        detectionCategoryMatchesTaxonGroup(String(row.category), taxonGroup),
      );
      const galleryItems = await hydrateGalleryItemsFromRows(rows);
      setIdentifications(mapGalleryItemsToIdentifications(userId, galleryItems));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load identifications.');
      setIdentifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, taxonGroup, limit]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { identifications, isLoading, error, refetch: fetch };
}
