import { useCallback, useEffect, useState } from 'react';

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

  const fetch = useCallback(() => {
    if (!userId) {
      setIdentifications([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);

    // TODO: replace with Firestore / Supabase query when saving identifications
    setIdentifications([]);
    setIsLoading(false);
  }, [userId, taxonGroup, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { identifications, isLoading, error, refetch: fetch };
}
