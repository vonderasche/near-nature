import type { RegionPackId } from '@/constants/regions';
import { evictAllCachedTfliteModels } from '@/lib/camera/tflite/cachedModels';
import {
  fetchRegionModelManifest,
  isRegionalModelBundleReady,
} from '@/services/regionModelDownloadService';

export { BUNDLED_REGION_IDS, isBundledRegion } from '@/services/regionModelDownloadService';

/**
 * Ensures on-device models for `regionId` are present before inference.
 * - Bundled regions (Southeast v1): immediate.
 * - Other regions: fetch manifest from Supabase Storage and download missing files.
 */
export async function ensureRegionalModels(regionId: RegionPackId): Promise<boolean> {
  if (isRegionalModelBundleReady(regionId)) {
    return true;
  }

  const manifest = await fetchRegionModelManifest(regionId);
  if (!manifest) {
    return false;
  }

  // TODO: download manifest.files to FileSystem documentDirectory/regions/{regionId}/
  // and persist manifest.version for isRegionalModelBundleReady().
  return false;
}

/** Evict cached models when the user switches region so the next run loads the correct pack. */
export function onActiveRegionChanged(
  _previous: RegionPackId | null,
  _next: RegionPackId,
): void {
  evictAllCachedTfliteModels();
}
