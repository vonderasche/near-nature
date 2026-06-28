import type { RegionPackId } from '@/constants/regions';

export type RegionModelDownloadStatus = 'bundled' | 'downloaded' | 'missing';

/**
 * Regions whose TFLite bundle ships inside the app binary.
 * Empty for release builds — all packs download from Supabase.
 */
export const BUNDLED_REGION_IDS: readonly RegionPackId[] = [];

const regionalBundleReadyCache: Partial<Record<RegionPackId, boolean>> = {};

export function isBundledRegion(regionId: RegionPackId): boolean {
  return BUNDLED_REGION_IDS.includes(regionId);
}

export function setRegionalModelBundleReadyCache(regionId: RegionPackId, ready: boolean): void {
  regionalBundleReadyCache[regionId] = ready;
}

export function clearRegionalModelBundleReadyCache(regionId?: RegionPackId): void {
  if (regionId) {
    delete regionalBundleReadyCache[regionId];
    return;
  }
  for (const key of Object.keys(regionalBundleReadyCache) as RegionPackId[]) {
    delete regionalBundleReadyCache[key];
  }
}

/** Sync readiness — uses in-memory cache updated after download verification. */
export function isRegionalModelBundleReady(regionId: RegionPackId): boolean {
  if (isBundledRegion(regionId)) {
    return true;
  }
  return regionalBundleReadyCache[regionId] === true;
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
