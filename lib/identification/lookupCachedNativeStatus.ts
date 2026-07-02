import { lookupNativeStatus, type NativeLookupResult } from '@/api/inaturalist';
import { loadStatusCache, saveStatusCache } from '@/lib/db/statusCacheRepository';
import { devLog } from '@/lib/devLog';

/**
 * Resolves native status via SQLite `status_cache`, then live iNaturalist on miss.
 * Caches both positive and not-found results to avoid repeat external calls.
 */
export async function lookupCachedNativeStatus(
  latinName: string,
  stateCode: string,
): Promise<NativeLookupResult | null> {
  const cached = await loadStatusCache(latinName, stateCode);
  if (cached) {
    devLog('[enrich] status cache hit', {
      latinName,
      stateCode,
      kind: cached.kind,
    });
    return cached.kind === 'found' ? cached.result : null;
  }

  const live = await lookupNativeStatus(latinName, stateCode);
  void saveStatusCache(latinName, stateCode, live);
  return live;
}
