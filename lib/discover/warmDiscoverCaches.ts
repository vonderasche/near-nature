import { FLORIDA_PARKS_CACHE_MAX_AGE_MS } from '@/constants/florida-parks-cache';
import { isCacheEntryFresh } from '@/lib/cache/isCacheEntryFresh';
import { devLog } from '@/lib/devLog';
import { loadCachedFloridaStateParksEntry } from '@/lib/parks/floridaStateParksCache';
import {
  loadFloridaStateParksFresh,
  setInMemoryFloridaStateParks,
} from '@/lib/parks/loadFloridaStateParks';

/** Prefetch parsed parks after sign-in so Discover opens instantly from device cache. */
export async function warmDiscoverCaches(): Promise<void> {
  const cached = await loadCachedFloridaStateParksEntry();
  if (cached) {
    setInMemoryFloridaStateParks(cached.value);

    if (!isCacheEntryFresh(cached.cachedAt, FLORIDA_PARKS_CACHE_MAX_AGE_MS)) {
      void loadFloridaStateParksFresh()
        .then(() => devLog('[auth] refreshed discover parks from cloud'))
        .catch(() => {});
    }
    return;
  }

  try {
    await loadFloridaStateParksFresh();
    devLog('[auth] warmed discover parks cache');
  } catch {
    // Non-blocking; Discover screen loads on open.
  }
}
