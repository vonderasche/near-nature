import type { TensorflowModelDelegate, TfliteModel } from 'react-native-fast-tflite';

import { DEFAULT_REGION_PACK_ID, type RegionPackId } from '@/constants/regions';
import {
  loadBundledTfliteModel,
  loadTfliteModelFromUri,
} from '@/lib/camera/tflite/loadBundledTfliteModel';

const modelCache = new Map<string, Promise<TfliteModel>>();
const evictionListeners = new Set<() => void>();

let activeRegionIdForModels: RegionPackId = DEFAULT_REGION_PACK_ID;

export function setActiveRegionForTfliteCache(regionId: RegionPackId): void {
  activeRegionIdForModels = regionId;
}

export function getActiveRegionForTfliteCache(): RegionPackId {
  return activeRegionIdForModels;
}

function uriCacheKey(uri: string, delegates: TensorflowModelDelegate[]): string {
  return `uri:${uri}:${delegates.join(',')}`;
}

export function subscribeTfliteModelEviction(listener: () => void): () => void {
  evictionListeners.add(listener);
  return () => {
    evictionListeners.delete(listener);
  };
}

export function notifyTfliteModelEviction(): void {
  for (const listener of evictionListeners) {
    listener();
  }
}

export function getCachedTfliteModel(
  modelAsset: number,
  delegates: TensorflowModelDelegate[] = [],
): Promise<TfliteModel> {
  const cacheKey = `bundled:${modelAsset}:${delegates.join(',')}`;
  const existing = modelCache.get(cacheKey);
  if (existing) return existing;

  const pending = loadBundledTfliteModel(modelAsset, delegates);
  modelCache.set(cacheKey, pending);
  return pending;
}

export function getCachedTfliteModelFromUri(
  fileUri: string,
  delegates: TensorflowModelDelegate[] = [],
): Promise<TfliteModel> {
  const cacheKey = uriCacheKey(fileUri, delegates);
  const existing = modelCache.get(cacheKey);
  if (existing) return existing;

  const pending = loadTfliteModelFromUri(fileUri, delegates);
  modelCache.set(cacheKey, pending);
  return pending;
}

/** Remove a cached model entry so the next load creates a fresh native instance (best-effort RAM relief). */
export function evictCachedTfliteModel(
  modelAsset: number,
  delegates: TensorflowModelDelegate[] = [],
): void {
  const cacheKey = `bundled:${modelAsset}:${delegates.join(',')}`;
  modelCache.delete(cacheKey);
}

/** Drop all JS-cached model promises before a heavy capture load (best-effort native RAM relief). */
export function evictAllCachedTfliteModels(): void {
  modelCache.clear();
  notifyTfliteModelEviction();
}
