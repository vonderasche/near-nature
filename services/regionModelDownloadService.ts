import type { RegionPackId } from '@/constants/regions';

export type RegionModelDownloadStatus = 'not_applicable' | 'coming_soon' | 'ready';

/**
 * Stub for Supabase Storage model downloads. Training and uploads happen in a separate project.
 */
export async function fetchRegionModelManifest(_regionId: RegionPackId): Promise<null> {
  return null;
}

export function getRegionModelDownloadStatus(regionId: RegionPackId): RegionModelDownloadStatus {
  if (regionId === 'southeast') return 'ready';
  return 'coming_soon';
}
