import type { RegionPackId } from '@/constants/regions';
import { getInfoAsync } from '@/lib/fs/legacyFileSystem';
import { getRegionModelFilePathForStorageId } from '@/lib/region/regionModelPaths';
import { getRegionModelStorageCandidates } from '@/lib/region/regionPackLegacy';
import type { SpecialistAssetFolder } from '@/lib/region/tfliteRouting';

/** Relative path under `regions/{storageId}/` for a specialist genus model. */
export function getSpecialistModelRelativePath(assetFolder: SpecialistAssetFolder): string {
  return `inat2021_specialists_v2/${assetFolder}/tflite/${assetFolder}_genus.tflite`;
}

export const REGIONAL_ROUTING_RELATIVE_PATH = 'inat2021_specialists_v2/routing.json';

/**
 * Returns a local file path when the bundle file exists on disk, otherwise `null`.
 */
export async function resolveModelBundleFileUri(
  storageId: string,
  relativePath: string,
): Promise<string | null> {
  const localPath = getRegionModelFilePathForStorageId(storageId, relativePath);
  const info = await getInfoAsync(localPath);
  if (info.exists) {
    return localPath;
  }
  return null;
}

/** @deprecated Use `resolveModelBundleFileUri`. */
export async function resolveRegionalModelUri(
  regionId: RegionPackId,
  relativePath: string,
): Promise<string | null> {
  for (const storageId of getRegionModelStorageCandidates(regionId)) {
    const uri = await resolveModelBundleFileUri(storageId, relativePath);
    if (uri) {
      return uri;
    }
  }
  return null;
}
