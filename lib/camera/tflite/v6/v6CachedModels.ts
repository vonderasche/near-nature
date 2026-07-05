import type { RegionPackId } from '@/constants/regions';
import { getCachedTfliteModel, getCachedTfliteModelFromUri } from '@/lib/camera/tflite/cachedModels';
import type { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';
import { classifyStillImage } from '@/lib/camera/tflite/staticImageClassifier';
import type { ClassificationPrediction } from '@/lib/camera/tflite/modelTypes';
import {
  v6CascadeRegionForAppRegion,
  type V6CascadeRegionId,
} from '@/lib/camera/tflite/v6/v6CascadeRegions';
import {
  getV6ModelConfig,
  getV6RegionalRelativePath,
  type V6StageKey,
} from '@/lib/camera/tflite/v6/v6ModelRegistry';
import { v6StageUsesGlobalBundle } from '@/lib/camera/tflite/v6/v6Groups';
import { resolveRegionalModelUri } from '@/lib/region/resolveRegionalModelUri';
import { getRegionModelStorageCandidates } from '@/lib/region/regionPackLegacy';

import type { CaptureMode } from '@/constants/identification-preferences';

async function resolveV6RegionalUri(
  appRegionId: RegionPackId,
  cascadeRegionId: V6CascadeRegionId,
  key: V6StageKey,
): Promise<string | null> {
  if (key === 'kingdom' || key === 'common_mammals') {
    return null;
  }

  const relativePath = getV6RegionalRelativePath(cascadeRegionId, key);
  for (const storageId of getRegionModelStorageCandidates(appRegionId)) {
    const uri = await resolveRegionalModelUri(storageId as RegionPackId, relativePath);
    if (uri) {
      return uri;
    }
  }
  return null;
}

async function loadV6Model(
  appRegionId: RegionPackId,
  key: V6StageKey,
  captureMode: CaptureMode,
): Promise<{ config: ClassificationModelConfig; model: Awaited<ReturnType<typeof getCachedTfliteModel>> }> {
  const config = getV6ModelConfig(key);
  const cascadeRegionId = v6CascadeRegionForAppRegion(appRegionId);

  if (v6StageUsesGlobalBundle(key, captureMode)) {
    return { config, model: await getCachedTfliteModel(config.model) };
  }

  const uri = await resolveV6RegionalUri(appRegionId, cascadeRegionId, key);
  if (uri) {
    return { config, model: await getCachedTfliteModelFromUri(uri) };
  }

  return { config, model: await getCachedTfliteModel(config.model) };
}

export async function runV6Stage(
  appRegionId: RegionPackId,
  key: V6StageKey,
  imageUri: string,
  captureMode: CaptureMode,
): Promise<{ predictions: ClassificationPrediction[] }> {
  const { config, model } = await loadV6Model(appRegionId, key, captureMode);
  const { predictions } = await classifyStillImage(imageUri, model, config);
  return { predictions };
}

export function isV6CaptureAvailable(appRegionId: RegionPackId, captureMode: CaptureMode): boolean {
  if (captureMode === 'global') {
    return true;
  }
  return v6CascadeRegionForAppRegion(appRegionId) != null;
}
