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
  /** Drops results from in-flight refetches (e.g. after a local profile patch). */
  invalidatePendingFetch: () => void;
  /** Apply in-memory + device cache immediately without a network round-trip. */
  applyLocalPatch: (value: T) => Promise<void>;
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
  const inFlightRef = useRef<Promise<void> | null>(null);
  const requestIdRef = useRef(0);
  /** Monotonic stamp: refetch must not apply older cache/network over a newer local patch. */
  const dataRevisionAtRef = useRef(0);

  const loadCacheRef = useRef(loadCache);
  loadCacheRef.current = loadCache;
  const fetchFreshRef = useRef(fetchFresh);
  fetchFreshRef.current = fetchFresh;
  const saveCacheRef = useRef(saveCache);
  saveCacheRef.current = saveCache;
  const onFreshRef = useRef(onFresh);
  onFreshRef.current = onFresh;
  const mapErrorRef = useRef(mapError);
  mapErrorRef.current = mapError;

  const refetch = useCallback(
    async (options?: { force?: boolean }) => {
      if (!enabled) {
        setData(null);
        setError(null);
        setLoading(false);
        setRefreshing(false);
        hadCacheRef.current = false;
        inFlightRef.current = null;
        return;
      }

      if (inFlightRef.current) {
        return inFlightRef.current;
      }

      const run = async () => {
        const requestId = ++requestIdRef.current;
        const force = options?.force ?? false;
        const cached = force ? null : await loadCacheRef.current();
        const cacheIsFresh =
          cached != null && isCacheEntryFresh(cached.cachedAt, maxAgeMs);
        const phase = resolveCacheFirstLoadingPhase(force, cached, { cacheIsFresh });
        const showedCache = phase.showedCache;

        if (cached != null && cached.cachedAt >= dataRevisionAtRef.current) {
          setData(cached.value);
          hadCacheRef.current = true;
        } else if (cached != null) {
          hadCacheRef.current = true;
        }
        setLoading(phase.initialLoading);
        setRefreshing(phase.backgroundRefreshing);
        setError(null);

        if (cacheIsFresh && !force) {
          return;
        }

        try {
          const fresh = await fetchFreshRef.current();
          if (requestId !== requestIdRef.current) return;
          setData(fresh);
          dataRevisionAtRef.current = Date.now();
          await onFreshRef.current?.(fresh);
          const persist = saveCacheRef.current;
          if (persist) {
            await persist(fresh);
          }
        } catch (e) {
          if (requestId !== requestIdRef.current) return;
          if (clearDataOnErrorWithoutCache && !showedCache && !hadCacheRef.current) {
            setData(null);
          }
          setError(mapErrorRef.current(e));
        } finally {
          if (requestId === requestIdRef.current) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      };

      const promise = run().finally(() => {
        if (inFlightRef.current === promise) {
          inFlightRef.current = null;
        }
      });
      inFlightRef.current = promise;
      return promise;
    },
    [clearDataOnErrorWithoutCache, enabled, maxAgeMs],
  );

  const invalidatePendingFetch = useCallback(() => {
    requestIdRef.current += 1;
    setRefreshing(false);
  }, []);

  const applyLocalPatch = useCallback(
    async (value: T) => {
      const revisionAt = Date.now();
      dataRevisionAtRef.current = revisionAt;
      invalidatePendingFetch();
      setData(value);
      const persist = saveCacheRef.current;
      if (persist) {
        await persist(value);
      }
    },
    [invalidatePendingFetch],
  );

  useEffect(() => {
    hadCacheRef.current = false;
    dataRevisionAtRef.current = 0;
    void refetch();
  }, [enabled, refetch]);

  return {
    data,
    setData,
    loading,
    refreshing,
    error,
    setError,
    refetch,
    invalidatePendingFetch,
    applyLocalPatch,
  };
}
