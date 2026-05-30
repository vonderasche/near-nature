import { useCallback, useEffect, useRef, useState } from 'react';

import type { CacheFirstEntry } from '@/lib/cache/cacheFirstEntry';
import { isCacheEntryFresh } from '@/lib/cache/isCacheEntryFresh';
import { resolveCacheFirstLoadingPhase } from '@/lib/cache/resolveCacheFirstLoadingPhase';
import { DEFAULT_CACHE_MAX_AGE_MS } from '@/constants/cache-ttl';
import { errorMessageFromUnknown } from '@/lib/errors/errorMessage';

export type { CacheFirstEntry } from '@/lib/cache/cacheFirstEntry';

export type UseCacheFirstFetchOptions<T> = {
  /** When false, clears data and skips network. */
  enabled: boolean;
  loadCache: () => Promise<CacheFirstEntry<T> | null>;
  fetchFresh: () => Promise<T>;
  saveCache?: (value: T) => Promise<void>;
  /** Runs after a successful network fetch (before cache write). */
  onFresh?: (value: T) => void | Promise<void>;
  /** When true, clears `data` on error if there was no cache. Default true. */
  clearDataOnErrorWithoutCache?: boolean;
  /** Skip background refresh when cache age is within this window. */
  maxAgeMs?: number;
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
 * Paginated lists (gallery, explorer board) apply TTL in their own hooks.
 */
export function useCacheFirstFetch<T>({
  enabled,
  loadCache,
  fetchFresh,
  saveCache,
  onFresh,
  clearDataOnErrorWithoutCache = true,
  maxAgeMs = DEFAULT_CACHE_MAX_AGE_MS,
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
      const cacheIsFresh =
        cached != null && isCacheEntryFresh(cached.cachedAt, maxAgeMs);
      const phase = resolveCacheFirstLoadingPhase(force, cached, { cacheIsFresh });
      const showedCache = phase.showedCache;

      if (cached != null) {
        setData(cached.value);
        hadCacheRef.current = true;
      }
      setLoading(phase.initialLoading);
      setRefreshing(phase.backgroundRefreshing);
      setError(null);

      if (cacheIsFresh && !force) {
        return;
      }

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
      maxAgeMs,
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
