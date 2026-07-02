import type { RegionPackId } from '@/constants/regions';
import { getInfoAsync, readAsStringAsync } from '@/lib/fs/legacyFileSystem';
import {
  getRegionModelFilePathForStorageId,
  getRegionModelManifestPathForStorageId,
} from '@/lib/region/regionModelPaths';
import { getRegionModelStorageCandidates } from '@/lib/region/regionPackLegacy';
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
function parseManifestPayload(
  regionId: RegionPackId,
  data: ArrayBuffer,
  storageId: string,
): RegionModelManifest | null {
  try {
    const text = new TextDecoder().decode(data);
    const parsed = JSON.parse(text) as RegionModelManifest;
    const manifestRegionId = parsed.regionId;
    const validRegion =
      manifestRegionId === regionId ||
      manifestRegionId === storageId ||
      getRegionModelStorageCandidates(regionId).includes(manifestRegionId);
    if (!validRegion || !Array.isArray(parsed.files) || parsed.files.length === 0) {
      return null;
    }
    return enrichManifestUrls({ ...parsed, regionId });
  } catch {
    return null;
  }
}

export async function fetchRegionModelManifest(regionId: RegionPackId): Promise<RegionModelManifest | null> {
  for (const storageId of getRegionModelStorageCandidates(regionId)) {
    const storagePath = `${storageId}/manifest.json`;
    const result = await downloadRegionModelObject(storagePath);
    if (!result.ok) {
      continue;
    }
    const manifest = parseManifestPayload(regionId, result.data, storageId);
    if (manifest) {
      return manifest;
    }
  }
  return null;
}

async function readLocalManifest(regionId: RegionPackId): Promise<RegionModelManifest | null> {
  for (const storageId of getRegionModelStorageCandidates(regionId)) {
    const manifestPath = getRegionModelManifestPathForStorageId(storageId);
    const info = await getInfoAsync(manifestPath);
    if (!info.exists) {
      continue;
    }
    try {
      const text = await readAsStringAsync(manifestPath);
      const parsed = JSON.parse(text) as RegionModelManifest;
      return { ...parsed, regionId };
    } catch {
      continue;
    }
  }
  return null;
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
    let found = false;
    for (const storageId of getRegionModelStorageCandidates(regionId)) {
      const localPath = getRegionModelFilePathForStorageId(storageId, file.path);
      const info = await getInfoAsync(localPath);
      if (!info.exists) {
        continue;
      }
      if (
        file.sizeBytes != null &&
        'size' in info &&
        typeof info.size === 'number' &&
        info.size !== file.sizeBytes
      ) {
        return false;
      }
      found = true;
      break;
    }
    if (!found) {
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
