import { documentDirectory } from 'expo-file-system/legacy';

import type { RegionPackId } from '@/constants/regions';

export const REGION_DOWNLOAD_PROGRESS_STORAGE_PREFIX = 'near_nature:region_download:';

/** Local root: `{documentDirectory}regions/{storageId}/` */
export function getRegionModelRootForStorageId(storageId: string): string {
  const base = documentDirectory ?? '';
  return `${base}regions/${storageId}/`;
}

/** Canonical on-device root for a pack (new downloads always land here). */
export function getRegionModelRoot(regionId: RegionPackId): string {
  return getRegionModelRootForStorageId(regionId);
}

export function getRegionModelFilePath(regionId: RegionPackId, relativePath: string): string {
  const normalized = relativePath.replace(/^\/+/, '');
  return `${getRegionModelRoot(regionId)}${normalized}`;
}

export function getRegionModelFilePathForStorageId(storageId: string, relativePath: string): string {
  const normalized = relativePath.replace(/^\/+/, '');
  return `${getRegionModelRootForStorageId(storageId)}${normalized}`;
}

export function getRegionModelManifestPath(regionId: RegionPackId): string {
  return getRegionModelFilePath(regionId, 'manifest.json');
}

export function getRegionModelManifestPathForStorageId(storageId: string): string {
  return getRegionModelFilePathForStorageId(storageId, 'manifest.json');
}

export function getRegionDownloadProgressStorageKey(regionId: RegionPackId): string {
  return `${REGION_DOWNLOAD_PROGRESS_STORAGE_PREFIX}${regionId}`;
}
