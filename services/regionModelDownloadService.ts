import type { RegionPackId } from '@/constants/regions';
import { getInfoAsync, readAsStringAsync } from '@/lib/fs/legacyFileSystem';
import {
  getRegionModelFilePath,
  getRegionModelManifestPath,
} from '@/lib/region/regionModelPaths';
import {
  isBundledRegion,
  setRegionalModelBundleReadyCache,
} from '@/lib/region/regionalModelReadyState';
import {
  downloadRegionModelObject,
  getRegionModelObjectPublicUrl,
} from '@/services/regionModelsStorage';

export type RegionModelManifestFile = {
  /** Path relative to `documentDirectory/regions/{regionId}/`. */
  path: string;
  /** Object key in the `region-models` bucket. */
  storagePath: string;
  sizeBytes?: number;
  sha256?: string;
  /** Populated after fetch for download URLs. */
  url?: string;
};

/** Manifest for a regional model bundle uploaded to Supabase Storage. */
export type RegionModelManifest = {
  regionId: RegionPackId;
  version: string;
  bundle?: string;
  builtAt?: string;
  minAppVersion?: string;
  totalSizeBytes?: number;
  files: RegionModelManifestFile[];
};

export {
  BUNDLED_REGION_IDS,
  clearRegionalModelBundleReadyCache,
  getRegionModelDownloadStatus,
  isBundledRegion,
  isRegionalModelBundleReady,
} from '@/lib/region/regionalModelReadyState';

function enrichManifestUrls(manifest: RegionModelManifest): RegionModelManifest {
  return {
    ...manifest,
    files: manifest.files.map((file) => ({
      ...file,
      url: file.url ?? getRegionModelObjectPublicUrl(file.storagePath),
    })),
  };
}

/**
 * Fetch the latest manifest for a region from Supabase Storage.
 * Returns null when the region has not been published yet.
 */
export async function fetchRegionModelManifest(regionId: RegionPackId): Promise<RegionModelManifest | null> {
  const storagePath = `${regionId}/manifest.json`;
  const result = await downloadRegionModelObject(storagePath);
  if (!result.ok) {
    return null;
  }

  try {
    const text = new TextDecoder().decode(result.data);
    const parsed = JSON.parse(text) as RegionModelManifest;
    if (parsed.regionId !== regionId || !Array.isArray(parsed.files) || parsed.files.length === 0) {
      return null;
    }
    return enrichManifestUrls(parsed);
  } catch {
    return null;
  }
}

async function readLocalManifest(regionId: RegionPackId): Promise<RegionModelManifest | null> {
  const manifestPath = getRegionModelManifestPath(regionId);
  const info = await getInfoAsync(manifestPath);
  if (!info.exists) {
    return null;
  }
  try {
    const text = await readAsStringAsync(manifestPath);
    return JSON.parse(text) as RegionModelManifest;
  } catch {
    return null;
  }
}

/** True when TFLite assets for this region are on-device (bundled or previously downloaded). */
export async function verifyRegionalModelBundleReady(regionId: RegionPackId): Promise<boolean> {
  if (isBundledRegion(regionId)) {
    return true;
  }

  const manifest = await readLocalManifest(regionId);
  if (!manifest?.version || !manifest.files?.length) {
    return false;
  }

  for (const file of manifest.files) {
    const localPath = getRegionModelFilePath(regionId, file.path);
    const info = await getInfoAsync(localPath);
    if (!info.exists) {
      return false;
    }
    if (
      file.sizeBytes != null &&
      info.exists &&
      'size' in info &&
      typeof info.size === 'number' &&
      info.size !== file.sizeBytes
    ) {
      return false;
    }
  }
  return true;
}

export async function refreshRegionalModelBundleReadyCache(regionId: RegionPackId): Promise<boolean> {
  const ready = await verifyRegionalModelBundleReady(regionId);
  setRegionalModelBundleReadyCache(regionId, ready);
  return ready;
}
