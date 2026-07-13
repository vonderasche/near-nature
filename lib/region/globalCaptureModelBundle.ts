import { GLOBAL_CAPTURE_STORAGE_ID } from '@/constants/modelBundles';
import { evictAllCachedTfliteModels } from '@/lib/camera/tflite/cachedModels';
import { evictV18CachedModel } from '@/lib/camera/tflite/v18/v18CachedModels';
import {
  ensureModelBundle,
  refreshModelBundleReadyCache,
  type ModelBundleDownloadProgress,
} from '@/lib/region/modelBundleDownload';
import {
  clearGlobalCaptureModelBundleReadyCache,
  setGlobalCaptureModelBundleReadyCache,
} from '@/lib/region/globalCaptureModelReadyState';

export type EnsureGlobalCaptureModelsProgress = ModelBundleDownloadProgress;

export type EnsureGlobalCaptureModelsOptions = {
  onProgress?: (progress: EnsureGlobalCaptureModelsProgress) => void;
};

export {
  clearGlobalCaptureModelBundleReadyCache,
  isGlobalCaptureModelBundleReady,
  setGlobalCaptureModelBundleReadyCache,
} from '@/lib/region/globalCaptureModelReadyState';

export async function refreshGlobalCaptureModelBundleReadyCache(): Promise<boolean> {
  return refreshModelBundleReadyCache(GLOBAL_CAPTURE_STORAGE_ID, setGlobalCaptureModelBundleReadyCache);
}

/**
 * Ensures the global v18 capture model is on-device and up to date.
 * Downloads from Supabase Storage (`region-models/global/`) on first launch
 * and again when a newer manifest is published.
 */
export async function ensureGlobalCaptureModels(
  options?: EnsureGlobalCaptureModelsOptions,
): Promise<boolean> {
  return ensureModelBundle(GLOBAL_CAPTURE_STORAGE_ID, setGlobalCaptureModelBundleReadyCache, {
    onProgress: options?.onProgress,
    onUpdated: onGlobalCaptureModelsUpdated,
  });
}

/** Evict cached models after a fresh download so the next capture load uses new files. */
export function onGlobalCaptureModelsUpdated(): void {
  evictV18CachedModel();
  evictAllCachedTfliteModels();
}
