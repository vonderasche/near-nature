import {
  FLORIDA_PARKS_CACHE_KEY,
  FLORIDA_PARKS_CACHE_VERSION,
} from '@/constants/florida-parks-cache';
import type { CacheFirstEntry } from '@/lib/cache/cacheFirstEntry';
import {
  clearDualStorageEntry,
  loadDualStorageJson,
  saveDualStorageJson,
} from '@/lib/db/dualStorageJsonCache';
import { deleteGlobalCache, loadGlobalCacheJson, saveGlobalCacheJson } from '@/lib/db/globalCacheRepository';
import {
  parseCachedFloridaStateParks,
  type CachedFloridaStateParks,
} from '@/lib/parks/floridaStateParksCacheParse';
import type { FloridaStatePark } from '@/types/florida-state-park';

export type { CachedFloridaStateParks } from '@/lib/parks/floridaStateParksCacheParse';
export { parseCachedFloridaStateParks } from '@/lib/parks/floridaStateParksCacheParse';

export async function loadCachedFloridaStateParks(): Promise<CachedFloridaStateParks | null> {
  return loadDualStorageJson({
    loadSqliteJson: () => loadGlobalCacheJson(FLORIDA_PARKS_CACHE_KEY),
    asyncStorageKey: FLORIDA_PARKS_CACHE_KEY,
    parse: parseCachedFloridaStateParks,
    migrateSqlite: (json) => {
      const parsed = parseCachedFloridaStateParks(json);
      if (!parsed) return Promise.resolve();
      return saveGlobalCacheJson(
        FLORIDA_PARKS_CACHE_KEY,
        json,
        parsed.cachedAt,
        FLORIDA_PARKS_CACHE_VERSION,
      );
    },
  });
}

export async function loadCachedFloridaStateParksEntry(): Promise<CacheFirstEntry<
  FloridaStatePark[]
> | null> {
  const cached = await loadCachedFloridaStateParks();
  if (!cached) return null;
  return { value: cached.parks, cachedAt: cached.cachedAt };
}

export async function saveCachedFloridaStateParks(parks: readonly FloridaStatePark[]): Promise<void> {
  const entry: CachedFloridaStateParks = {
    v: FLORIDA_PARKS_CACHE_VERSION,
    parks: [...parks],
    cachedAt: Date.now(),
  };
  const json = JSON.stringify(entry);

  await saveDualStorageJson({
    asyncStorageKey: FLORIDA_PARKS_CACHE_KEY,
    json,
    saveSqlite: () =>
      saveGlobalCacheJson(
        FLORIDA_PARKS_CACHE_KEY,
        json,
        entry.cachedAt,
        FLORIDA_PARKS_CACHE_VERSION,
      ),
  });
}

export async function invalidateCachedFloridaStateParks(): Promise<void> {
  await clearDualStorageEntry({
    asyncStorageKey: FLORIDA_PARKS_CACHE_KEY,
    clearSqlite: () => deleteGlobalCache(FLORIDA_PARKS_CACHE_KEY),
  });
}
