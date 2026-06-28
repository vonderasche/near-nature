import type { TensorflowModelDelegate, TfliteModel } from 'react-native-fast-tflite';

import { DEFAULT_REGION_PACK_ID, type RegionPackId } from '@/constants/regions';
import {
  loadBundledTfliteModel,
  loadTfliteModelFromUri,
} from '@/lib/camera/tflite/loadBundledTfliteModel';
import {
  mobilevitRoutingCaptureConfig,
  specialistCaptureConfig,
} from '@/lib/camera/tflite/modelConfigs';
import { classifyStillImage } from '@/lib/camera/tflite/staticImageClassifier';
import type { ClassificationPrediction } from '@/lib/camera/tflite/modelTypes';
import type { SpecialistAssetFolder } from '@/lib/camera/mobilenet/tfliteRouting';
import {
  getSpecialistDefinition,
  type SpecialistModelDefinition,
} from '@/lib/camera/mobilenet/specialistModelRegistry';
import {
  getSpecialistModelRelativePath,
  resolveRegionalModelUri,
} from '@/lib/region/resolveRegionalModelUri';

const modelCache = new Map<string, Promise<TfliteModel>>();
const specialistModelPromises: Partial<Record<string, Promise<TfliteModel>>> = {};
let mobilevitRoutingModelPromise: Promise<TfliteModel> | null = null;
const evictionListeners = new Set<() => void>();

let activeRegionIdForModels: RegionPackId = DEFAULT_REGION_PACK_ID;

export function setActiveRegionForTfliteCache(regionId: RegionPackId): void {
  activeRegionIdForModels = regionId;
}

export function getActiveRegionForTfliteCache(): RegionPackId {
  return activeRegionIdForModels;
}

function specialistCacheKey(regionId: RegionPackId, assetFolder: SpecialistAssetFolder): string {
  return `${regionId}:${assetFolder}`;
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
  for (const key of Object.keys(specialistModelPromises)) {
    delete specialistModelPromises[key];
  }
  mobilevitRoutingModelPromise = null;
  notifyTfliteModelEviction();
}

export async function loadMobileVitRoutingModel(): Promise<TfliteModel> {
  if (!mobilevitRoutingModelPromise) {
    mobilevitRoutingModelPromise = loadBundledTfliteModel(mobilevitRoutingCaptureConfig.model, []);
  }
  return mobilevitRoutingModelPromise;
}

export async function loadSpecialistModel(
  assetFolder: SpecialistAssetFolder,
  regionId: RegionPackId = activeRegionIdForModels,
): Promise<TfliteModel> {
  const cacheKey = specialistCacheKey(regionId, assetFolder);
  if (!specialistModelPromises[cacheKey]) {
    const specialist = getSpecialistDefinition(assetFolder);
    if (!specialist) {
      throw new Error(`Missing specialist model for ${assetFolder}.`);
    }

    specialistModelPromises[cacheKey] = (async () => {
      const relativePath = specialist.modelRelativePath ?? getSpecialistModelRelativePath(assetFolder);
      const uri = await resolveRegionalModelUri(regionId, relativePath);
      if (!uri) {
        throw new Error(
          `Regional specialist model not found for ${assetFolder} (${regionId}). Download your region pack first.`,
        );
      }
      return getCachedTfliteModelFromUri(uri, []);
    })();
  }
  return specialistModelPromises[cacheKey]!;
}

export async function runCaptureRouting(
  imageUri: string,
): Promise<{
  predictions: ClassificationPrediction[];
  preprocessMs: number;
  inferenceMs: number;
}> {
  const model = await loadMobileVitRoutingModel();
  return classifyStillImage(imageUri, model, mobilevitRoutingCaptureConfig);
}

export async function runSpecialistCapture(
  imageUri: string,
  specialist: SpecialistModelDefinition,
): Promise<{
  predictions: ClassificationPrediction[];
  preprocessMs: number;
  inferenceMs: number;
}> {
  const model = await loadSpecialistModel(specialist.assetFolder);
  return classifyStillImage(imageUri, model, specialistCaptureConfig(specialist));
}
