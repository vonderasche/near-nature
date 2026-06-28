import type { RegionPackId } from '@/constants/regions';
import { getInfoAsync } from '@/lib/fs/legacyFileSystem';
import { getRegionModelFilePath } from '@/lib/region/regionModelPaths';
import type { SpecialistAssetFolder } from '@/lib/camera/mobilenet/tfliteRouting';

/** Relative path under `regions/{regionId}/` for a specialist genus model. */
export function getSpecialistModelRelativePath(assetFolder: SpecialistAssetFolder): string {
  return `inat2021_specialists_v2/${assetFolder}/tflite/${assetFolder}_genus.tflite`;
}

export const REGIONAL_ROUTING_RELATIVE_PATH = 'inat2021_specialists_v2/routing.json';

/**
 * Returns a `file://` URI when the regional file exists on disk, otherwise `null`.
 */
export async function resolveRegionalModelUri(
  regionId: RegionPackId,
  relativePath: string,
): Promise<string | null> {
  const localPath = getRegionModelFilePath(regionId, relativePath);
  const info = await getInfoAsync(localPath);
  if (!info.exists) {
    return null;
  }
  return localPath;
}
