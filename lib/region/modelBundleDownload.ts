import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  downloadAsync,
  getInfoAsync,
  makeDirectoryAsync,
  moveAsync,
  readAsStringAsync,
  writeAsStringAsync,
} from '@/lib/fs/legacyFileSystem';
import {
  getRegionModelFilePathForStorageId,
  getRegionModelManifestPathForStorageId,
  getRegionModelRootForStorageId,
} from '@/lib/region/regionModelPaths';
import { getRegionModelObjectPublicUrl } from '@/services/regionModelsStorage';
import type { RegionModelManifest } from '@/services/regionModelDownloadService';
import { modelBundleNeedsUpdate } from '@/lib/region/modelBundleVersionCheck';
import { downloadRegionModelObject } from '@/services/regionModelsStorage';

export { modelBundleNeedsUpdate } from '@/lib/region/modelBundleVersionCheck';

const DOWNLOAD_CONCURRENCY = 2;
const MODEL_BUNDLE_PROGRESS_PREFIX = 'near_nature:model_bundle_download:';

export type ModelBundleDownloadProgress = {
  completedFiles: number;
  totalFiles: number;
  bytesDownloaded: number;
  totalBytes: number;
};

export type ModelBundleDownloadProgressCallback = (progress: ModelBundleDownloadProgress) => void;

function getModelBundleProgressStorageKey(storageId: string): string {
  return `${MODEL_BUNDLE_PROGRESS_PREFIX}${storageId}`;
}

async function ensureParentDirectory(filePath: string): Promise<void> {
  const slash = filePath.lastIndexOf('/');
  if (slash <= 0) return;
  const parent = filePath.slice(0, slash);
  await makeDirectoryAsync(parent, { intermediates: true });
}

async function persistDownloadProgress(
  storageId: string,
  progress: ModelBundleDownloadProgress,
): Promise<void> {
  await AsyncStorage.setItem(getModelBundleProgressStorageKey(storageId), JSON.stringify(progress)).catch(
    () => {},
  );
}

function enrichManifestUrls(manifest: RegionModelManifest): RegionModelManifest {
  return {
    ...manifest,
    files: manifest.files.map((file) => ({
      ...file,
      url: file.url ?? getRegionModelObjectPublicUrl(file.storagePath),
    })),
  };
}

function parseManifestPayload(data: ArrayBuffer, storageId: string): RegionModelManifest | null {
  try {
    const text = new TextDecoder().decode(data);
    const parsed = JSON.parse(text) as RegionModelManifest;
    const manifestStorageId = parsed.regionId;
    if (
      (manifestStorageId !== storageId && manifestStorageId !== 'global') ||
      !Array.isArray(parsed.files) ||
      parsed.files.length === 0
    ) {
      return null;
    }
    return enrichManifestUrls({ ...parsed, regionId: storageId });
  } catch {
    return null;
  }
}

async function readLocalModelBundleManifest(storageId: string): Promise<RegionModelManifest | null> {
  const manifestPath = getRegionModelManifestPathForStorageId(storageId);
  const info = await getInfoAsync(manifestPath);
  if (!info.exists) {
    return null;
  }
  try {
    const text = await readAsStringAsync(manifestPath);
    const parsed = JSON.parse(text) as RegionModelManifest;
    if (!Array.isArray(parsed.files) || parsed.files.length === 0) {
      return null;
    }
    return enrichManifestUrls(parsed);
  } catch {
    return null;
  }
}

export async function fetchModelBundleManifest(storageId: string): Promise<RegionModelManifest | null> {
  const storagePath = `${storageId}/manifest.json`;
  const result = await downloadRegionModelObject(storagePath);
  if (!result.ok) {
    return null;
  }
  return parseManifestPayload(result.data, storageId);
}

export async function readInstalledModelBundleManifest(
  storageId: string,
): Promise<RegionModelManifest | null> {
  return readLocalModelBundleManifest(storageId);
}

export type EnsureModelBundleOptions = {
  onProgress?: ModelBundleDownloadProgressCallback;
  onUpdated?: () => void;
};

/**
 * Ensures the installed bundle matches the latest remote manifest.
 * Re-downloads when version, bundle name, or file checksums change.
 */
export async function ensureModelBundle(
  storageId: string,
  setReady: (ready: boolean) => void,
  options?: EnsureModelBundleOptions,
): Promise<boolean> {
  const remote = await fetchModelBundleManifest(storageId);
  const localReady = await verifyModelBundleReady(storageId);
  const local = localReady ? await readLocalModelBundleManifest(storageId) : null;

  if (remote && modelBundleNeedsUpdate(local, remote)) {
    await downloadModelBundle(storageId, remote, options?.onProgress);
    options?.onUpdated?.();
  } else if (!remote && !localReady) {
    setReady(false);
    return false;
  }

  const ready = await verifyModelBundleReady(storageId);
  setReady(ready);
  return ready;
}

export async function verifyModelBundleReady(storageId: string): Promise<boolean> {
  const manifest = await readLocalModelBundleManifest(storageId);
  if (!manifest?.version || !manifest.files?.length) {
    return false;
  }

  for (const file of manifest.files) {
    const localPath = getRegionModelFilePathForStorageId(storageId, file.path);
    const info = await getInfoAsync(localPath);
    if (!info.exists) {
      return false;
    }
    if (
      file.sizeBytes != null &&
      'size' in info &&
      typeof info.size === 'number' &&
      info.size !== file.sizeBytes
    ) {
      return false;
    }
  }
  return true;
}

async function downloadManifestFile(
  storageId: string,
  file: RegionModelManifest['files'][number],
): Promise<void> {
  const localPath = getRegionModelFilePathForStorageId(storageId, file.path);
  await ensureParentDirectory(localPath);

  const publicUrl = file.url || getRegionModelObjectPublicUrl(file.storagePath);
  const result = await downloadAsync(publicUrl, localPath);
  if (result.status !== 200) {
    throw new Error(`Download failed (${result.status}) for ${file.path}`);
  }

  if (file.sizeBytes != null) {
    const info = await getInfoAsync(localPath);
    if (!info.exists || !('size' in info) || typeof info.size !== 'number' || info.size !== file.sizeBytes) {
      throw new Error(`Size mismatch for ${file.path}: expected ${file.sizeBytes}`);
    }
  }
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let index = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) {
      const current = items[index];
      index += 1;
      await worker(current);
    }
  });
  await Promise.all(runners);
}

export async function downloadModelBundle(
  storageId: string,
  manifest: RegionModelManifest,
  onProgress?: ModelBundleDownloadProgressCallback,
): Promise<void> {
  const root = getRegionModelRootForStorageId(storageId);
  await makeDirectoryAsync(root, { intermediates: true });

  const totalBytes = manifest.totalSizeBytes ?? manifest.files.reduce((sum, f) => sum + (f.sizeBytes ?? 0), 0);
  const totalFiles = manifest.files.length;
  let completedFiles = 0;
  let bytesDownloaded = 0;

  const report = () => {
    const snapshot: ModelBundleDownloadProgress = {
      completedFiles,
      totalFiles,
      bytesDownloaded,
      totalBytes,
    };
    void persistDownloadProgress(storageId, snapshot);
    onProgress?.(snapshot);
  };

  report();

  await runWithConcurrency(manifest.files, DOWNLOAD_CONCURRENCY, async (file) => {
    await downloadManifestFile(storageId, file);
    completedFiles += 1;
    bytesDownloaded += file.sizeBytes ?? 0;
    report();
  });

  const manifestPath = getRegionModelManifestPathForStorageId(storageId);
  const tempManifestPath = `${manifestPath}.tmp`;
  await writeAsStringAsync(tempManifestPath, JSON.stringify(manifest));
  await moveAsync({ from: tempManifestPath, to: manifestPath });
}

export async function refreshModelBundleReadyCache(
  storageId: string,
  setReady: (ready: boolean) => void,
): Promise<boolean> {
  const ready = await verifyModelBundleReady(storageId);
  setReady(ready);
  return ready;
}
