export type CacheFirstLoadingPhase = {
  showedCache: boolean;
  initialLoading: boolean;
  backgroundRefreshing: boolean;
};

/** Derives loading UI flags for stale-while-revalidate (see `useCacheFirstFetch`). */
export function resolveCacheFirstLoadingPhase(
  force: boolean,
  cached: unknown,
  options?: { cacheIsFresh?: boolean },
): CacheFirstLoadingPhase {
  if (force) {
    return {
      showedCache: false,
      initialLoading: false,
      backgroundRefreshing: true,
    };
  }
  if (cached != null) {
    if (options?.cacheIsFresh) {
      return {
        showedCache: true,
        initialLoading: false,
        backgroundRefreshing: false,
      };
    }
    return {
      showedCache: true,
      initialLoading: false,
      backgroundRefreshing: true,
    };
  }
  return {
    showedCache: false,
    initialLoading: true,
    backgroundRefreshing: false,
  };
}
