import { getLocalDatabase } from '@/lib/db/database';

/**
 * Clears per-user SQLite rows on sign-out.
 * Global reference data (e.g. species catalog) is intentionally kept.
 */
export async function clearUserScopedLocalData(): Promise<void> {
  if (!getLocalDatabase()) return;
  // Phase C: delete from gallery_cache_rows, scoring_snapshot, pending_detections, etc.
}
