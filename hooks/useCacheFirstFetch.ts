import { useCallback, useEffect, useRef, useState } from 'react';

import { resolveCacheFirstLoadingPhase } from '@/lib/cache/resolveCacheFirstLoadingPhase';
import { errorMessageFromUnknown } from '@/lib/errors/errorMessage';

export type UseCacheFirstFetchOptions<T> = {
  /** When false, clears data and skips network. */
  enabled: boolean;
  loadCache: () => Promise<T | null>;
  fetchFresh: () => Promise<T>;
  saveCache?: (value: T) => Promise<void>;
  /** Runs after a successful network fetch (before cache write). */
  onFresh?: (value: T) => void | Promise<void>;
  /** When true, clears `data` on error if there was no cache. Default true. */
  clearDataOnErrorWithoutCache?: boolean;
  mapError?: (error: unknown) => string;
};

export type UseCacheFirstFetchResult<T> = {
  data: T | null;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  refetch: (options?: { force?: boolean }) => Promise<void>;
};

/**
 * Stale-while-revalidate for a single cached resource (profile, scoring snapshot, etc.).
 * Paginated lists (gallery, explorer board) keep their own offset/cache logic.
 */
export function useCacheFirstFetch<T>({
  enabled,
  loadCache,
  fetchFresh,
  saveCache,
  onFresh,
  clearDataOnErrorWithoutCache = true,
  mapError = (e) => errorMessageFromUnknown(e, 'Failed to load'),
}: UseCacheFirstFetchOptions<T>): UseCacheFirstFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hadCacheRef = useRef(false);

  const refetch = useCallback(
    async (options?: { force?: boolean }) => {
      if (!enabled) {
        setData(null);
        setError(null);
        setLoading(false);
        setRefreshing(false);
        hadCacheRef.current = false;
        return;
      }

      const force = options?.force ?? false;
      const cached = force ? null : await loadCache();
      const phase = resolveCacheFirstLoadingPhase(force, cached);
      const showedCache = phase.showedCache;

      if (cached != null) {
        setData(cached);
        hadCacheRef.current = true;
      }
      setLoading(phase.initialLoading);
      setRefreshing(phase.backgroundRefreshing);

      setError(null);

      try {
        const fresh = await fetchFresh();
        setData(fresh);
        await onFresh?.(fresh);
        if (saveCache) {
          await saveCache(fresh);
        }
      } catch (e) {
        if (clearDataOnErrorWithoutCache && !showedCache && !hadCacheRef.current) {
          setData(null);
        }
        setError(mapError(e));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      clearDataOnErrorWithoutCache,
      enabled,
      fetchFresh,
      loadCache,
      mapError,
      onFresh,
      saveCache,
    ],
  );

  useEffect(() => {
    hadCacheRef.current = false;
    void refetch();
  }, [refetch]);

  return { data, setData, loading, refreshing, error, setError, refetch };
}
