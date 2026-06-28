import type { RegionPackId } from '@/constants/regions';
import { evictAllCachedTfliteModels, setActiveRegionForTfliteCache } from '@/lib/camera/tflite/cachedModels';
import { downloadRegionModelBundle } from '@/lib/region/downloadRegionModelBundle';
import { loadRegionalRoutingConfig } from '@/lib/region/regionalRoutingConfig';
import {
  fetchRegionModelManifest,
  refreshRegionalModelBundleReadyCache,
  verifyRegionalModelBundleReady,
} from '@/services/regionModelDownloadService';

export {
  BUNDLED_REGION_IDS,
  isBundledRegion,
} from '@/lib/region/regionalModelReadyState';

export type EnsureRegionalModelsProgress = {
  completedFiles: number;
  totalFiles: number;
  bytesDownloaded: number;
  totalBytes: number;
};

export type EnsureRegionalModelsOptions = {
  onProgress?: (progress: EnsureRegionalModelsProgress) => void;
};

/**
 * Ensures on-device models for `regionId` are present before inference.
 * Downloads from Supabase Storage when the local bundle is missing or incomplete.
 */
export async function ensureRegionalModels(
  regionId: RegionPackId,
  options?: EnsureRegionalModelsOptions,
): Promise<boolean> {
  setActiveRegionForTfliteCache(regionId);

  if (await verifyRegionalModelBundleReady(regionId)) {
    await refreshRegionalModelBundleReadyCache(regionId);
    await loadRegionalRoutingConfig(regionId);
    return true;
  }

  const manifest = await fetchRegionModelManifest(regionId);
  if (!manifest) {
    await refreshRegionalModelBundleReadyCache(regionId);
    return false;
  }

  await downloadRegionModelBundle(regionId, manifest, options?.onProgress);

  const ready = await verifyRegionalModelBundleReady(regionId);
  await refreshRegionalModelBundleReadyCache(regionId);
  if (ready) {
    await loadRegionalRoutingConfig(regionId);
  }
  return ready;
}

/** Evict cached models when the user switches region so the next run loads the correct pack. */
export function onActiveRegionChanged(
  _previous: RegionPackId | null,
  next: RegionPackId,
): void {
  setActiveRegionForTfliteCache(next);
  evictAllCachedTfliteModels();
}
