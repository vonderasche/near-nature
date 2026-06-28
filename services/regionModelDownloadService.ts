import type { RegionPackId } from '@/constants/regions';

export type RegionModelDownloadStatus = 'bundled' | 'downloaded' | 'missing';

/** Manifest for a regional model bundle uploaded to Supabase Storage (separate training project). */
export type RegionModelManifest = {
  regionId: RegionPackId;
  version: string;
  files: { path: string; url: string; sha256?: string }[];
};

/** Regions whose TFLite bundle ships inside the app binary today. */
export const BUNDLED_REGION_IDS: readonly RegionPackId[] = ['southeast'];

export function isBundledRegion(regionId: RegionPackId): boolean {
  return BUNDLED_REGION_IDS.includes(regionId);
}

/**
 * Fetch the latest manifest for a region from Supabase Storage.
 * Returns null when the region has not been published yet.
 */
export async function fetchRegionModelManifest(_regionId: RegionPackId): Promise<RegionModelManifest | null> {
  return null;
}

/** True when TFLite assets for this region are on-device (bundled or previously downloaded). */
export function isRegionalModelBundleReady(regionId: RegionPackId): boolean {
  if (isBundledRegion(regionId)) {
    return true;
  }
  // TODO: compare local manifest version under documentDirectory/regions/{regionId}/
  return false;
}

export function getRegionModelDownloadStatus(regionId: RegionPackId): RegionModelDownloadStatus {
  if (isBundledRegion(regionId)) {
    return 'bundled';
  }
  if (isRegionalModelBundleReady(regionId)) {
    return 'downloaded';
  }
  return 'missing';
}
