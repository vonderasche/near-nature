import AsyncStorage from '@react-native-async-storage/async-storage';

import type { RegionPackId } from '@/constants/regions';
import {
  downloadAsync,
  getInfoAsync,
  makeDirectoryAsync,
  moveAsync,
  writeAsStringAsync,
} from '@/lib/fs/legacyFileSystem';
import {
  getRegionDownloadProgressStorageKey,
  getRegionModelFilePath,
  getRegionModelManifestPath,
  getRegionModelRoot,
} from '@/lib/region/regionModelPaths';
import { getRegionModelObjectPublicUrl } from '@/services/regionModelsStorage';
import type { RegionModelManifest } from '@/services/regionModelDownloadService';

const DOWNLOAD_CONCURRENCY = 2;

export type RegionDownloadProgress = {
  completedFiles: number;
  totalFiles: number;
  bytesDownloaded: number;
  totalBytes: number;
};

export type RegionDownloadProgressCallback = (progress: RegionDownloadProgress) => void;

async function ensureParentDirectory(filePath: string): Promise<void> {
  const slash = filePath.lastIndexOf('/');
  if (slash <= 0) return;
  const parent = filePath.slice(0, slash);
  await makeDirectoryAsync(parent, { intermediates: true });
}

async function persistDownloadProgress(
  regionId: RegionPackId,
  progress: RegionDownloadProgress,
): Promise<void> {
  await AsyncStorage.setItem(
    getRegionDownloadProgressStorageKey(regionId),
    JSON.stringify(progress),
  ).catch(() => {});
}

async function downloadManifestFile(
  regionId: RegionPackId,
  file: RegionModelManifest['files'][number],
): Promise<void> {
  const localPath = getRegionModelFilePath(regionId, file.path);
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

/**
 * Download all files listed in `manifest` into `documentDirectory/regions/{regionId}/`.
 * Writes `manifest.json` atomically on success.
 */
export async function downloadRegionModelBundle(
  regionId: RegionPackId,
  manifest: RegionModelManifest,
  onProgress?: RegionDownloadProgressCallback,
): Promise<void> {
  const root = getRegionModelRoot(regionId);
  await makeDirectoryAsync(root, { intermediates: true });

  const totalBytes = manifest.totalSizeBytes ?? manifest.files.reduce((sum, f) => sum + (f.sizeBytes ?? 0), 0);
  const totalFiles = manifest.files.length;
  let completedFiles = 0;
  let bytesDownloaded = 0;

  const report = () => {
    const snapshot: RegionDownloadProgress = {
      completedFiles,
      totalFiles,
      bytesDownloaded,
      totalBytes,
    };
    void persistDownloadProgress(regionId, snapshot);
    onProgress?.(snapshot);
  };

  report();

  await runWithConcurrency(manifest.files, DOWNLOAD_CONCURRENCY, async (file) => {
    await downloadManifestFile(regionId, file);
    completedFiles += 1;
    bytesDownloaded += file.sizeBytes ?? 0;
    report();
  });

  const manifestPath = getRegionModelManifestPath(regionId);
  const tempManifestPath = `${manifestPath}.tmp`;
  await writeAsStringAsync(tempManifestPath, JSON.stringify(manifest));
  await moveAsync({ from: tempManifestPath, to: manifestPath });
}

export async function deleteRegionModelBundle(regionId: RegionPackId): Promise<void> {
  const root = getRegionModelRoot(regionId);
  const info = await getInfoAsync(root);
  if (info.exists) {
    const { deleteAsync } = await import('@/lib/fs/legacyFileSystem');
    await deleteAsync(root, { idempotent: true });
  }
  await AsyncStorage.removeItem(getRegionDownloadProgressStorageKey(regionId)).catch(() => {});
}
