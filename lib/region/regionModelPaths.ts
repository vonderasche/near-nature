import { documentDirectory } from 'expo-file-system/legacy';

import type { RegionPackId } from '@/constants/regions';

export const REGION_DOWNLOAD_PROGRESS_STORAGE_PREFIX = 'near_nature:region_download:';

/** Local root: `{documentDirectory}regions/{regionId}/` */
export function getRegionModelRoot(regionId: RegionPackId): string {
  const base = documentDirectory ?? '';
  return `${base}regions/${regionId}/`;
}

export function getRegionModelFilePath(regionId: RegionPackId, relativePath: string): string {
  const normalized = relativePath.replace(/^\/+/, '');
  return `${getRegionModelRoot(regionId)}${normalized}`;
}

export function getRegionModelManifestPath(regionId: RegionPackId): string {
  return getRegionModelFilePath(regionId, 'manifest.json');
}

export function getRegionDownloadProgressStorageKey(regionId: RegionPackId): string {
  return `${REGION_DOWNLOAD_PROGRESS_STORAGE_PREFIX}${regionId}`;
}
