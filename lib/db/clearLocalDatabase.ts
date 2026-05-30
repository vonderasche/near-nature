import {
  clearAllGalleryListCaches,
  clearAllSavedSpeciesCaches,
  clearAllScoringSnapshotCaches,
  clearAllSignedUrlCaches,
  clearAllUserProfileCaches,
} from '@/lib/db/userCacheRepository';
import { clearAllUserDetections } from '@/lib/db/detectionRepository';
import { getLocalDatabase } from '@/lib/db/database';

/**
 * Clears per-user SQLite rows on sign-out.
 * Global reference data (species catalog) is intentionally kept.
 */
export async function clearUserScopedLocalData(): Promise<void> {
  if (!getLocalDatabase()) return;

  await Promise.all([
    clearAllUserProfileCaches(),
    clearAllGalleryListCaches(),
    clearAllScoringSnapshotCaches(),
    clearAllSavedSpeciesCaches(),
    clearAllSignedUrlCaches(),
    clearAllUserDetections(),
  ]);
}
