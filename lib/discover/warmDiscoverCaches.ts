import { devLog } from '@/lib/devLog';
import {
  loadCachedFloridaStateParksEntry,
} from '@/lib/parks/floridaStateParksCache';
import {
  loadFloridaStateParksFromBundledCsv,
  setInMemoryFloridaStateParks,
} from '@/lib/parks/loadFloridaStateParks';

/** Prefetch parsed parks after sign-in so Discover opens instantly from device cache. */
export async function warmDiscoverCaches(): Promise<void> {
  const cached = await loadCachedFloridaStateParksEntry();
  if (cached) {
    setInMemoryFloridaStateParks(cached.value);
    return;
  }

  try {
    await loadFloridaStateParksFromBundledCsv();
    devLog('[auth] warmed discover parks cache');
  } catch {
    // Non-blocking; Discover screen loads on open.
  }
}
