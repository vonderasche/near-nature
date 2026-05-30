import { GALLERY_LIST_CACHE_KEY_PREFIX } from '@/constants/gallery-cache';
import { LOCAL_DETECTIONS_STORAGE_KEY_PREFIX } from '@/constants/local-detections';
import { OWN_PROFILE_CACHE_KEY_PREFIX } from '@/constants/profile-cache';
import { SCORING_SNAPSHOT_CACHE_KEY_PREFIX } from '@/constants/scoring-cache';
import { SIGNED_URL_CACHE_KEY_PREFIX } from '@/constants/signed-url-cache';
import { clearUserScopedLocalData } from '@/lib/db/clearLocalDatabase';
import { removeAsyncStorageKeysByPrefix } from '@/lib/db/dualStorageJsonCache';
import { clearAllPendingGalleryDetections } from '@/lib/detections/pendingGalleryDetection';
import { clearSignedDetectionUrlCache } from '@/lib/detections/signedDetectionUrlCache';
import { clearSavedSpeciesSession } from '@/lib/identification/savedSpeciesSessionCache';

const LEGACY_USER_CACHE_PREFIXES = [
  OWN_PROFILE_CACHE_KEY_PREFIX,
  GALLERY_LIST_CACHE_KEY_PREFIX,
  SCORING_SNAPSHOT_CACHE_KEY_PREFIX,
  SIGNED_URL_CACHE_KEY_PREFIX,
  LOCAL_DETECTIONS_STORAGE_KEY_PREFIX,
] as const;

/** Clears in-memory session caches, SQLite user rows, and legacy AsyncStorage cache keys. */
export async function clearLocalUserDataOnSignOut(): Promise<void> {
  clearSignedDetectionUrlCache();
  clearAllPendingGalleryDetections();
  clearSavedSpeciesSession();
  await clearUserScopedLocalData();
  await Promise.all(LEGACY_USER_CACHE_PREFIXES.map((prefix) => removeAsyncStorageKeysByPrefix(prefix)));
}
