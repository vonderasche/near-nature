import { useCallback, useEffect, useState } from 'react';

import { detectionCategoryMatchesTaxonGroup } from '@/lib/detections/detectionCategoryTaxonFilter';
import { mapDbNativeToSpeciesStatus } from '@/lib/detections/mapDbNativeToSpeciesStatus';
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
        .select('id, user_id, detected_at, common_name, latin_name, category, native_status')
        .eq('user_id', userId)
        .order('detected_at', { ascending: false })
        .limit(limit);

      if (queryError) throw queryError;

      const rows = (data ?? []).filter((row) =>
        detectionCategoryMatchesTaxonGroup(String(row.category), taxonGroup),
      );

      const mapped: Identification[] = rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        timestamp: row.detected_at,
        species: {
          id: row.id,
          latinName: row.latin_name,
          commonName: row.common_name,
          taxonGroup: String(row.category),
          status: mapDbNativeToSpeciesStatus(String(row.native_status)),
        },
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
