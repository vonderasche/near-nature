import type { RegionPackId } from '@/constants/regions';
import { v5CascadeRegionForAppRegion } from '@/lib/camera/tflite/v5/v5CascadeRegions';
import { getCachedTfliteModel, getCachedTfliteModelFromUri } from '@/lib/camera/tflite/cachedModels';
import type { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';
import { classifyStillImage } from '@/lib/camera/tflite/staticImageClassifier';
import type { ClassificationPrediction } from '@/lib/camera/tflite/modelTypes';
import {
  getV5GlobalRelativePath,
  getV5ModelConfig,
  getV5RegionalRelativePath,
  type V5SpecialistGroup,
} from '@/lib/camera/tflite/v5/v5ModelRegistry';
import { resolveRegionalModelUri } from '@/lib/region/resolveRegionalModelUri';
import { getRegionModelStorageCandidates } from '@/lib/region/regionPackLegacy';

type V5StageKey =
  | 'kingdom'
  | 'plant_router'
  | 'animal_router'
  | V5SpecialistGroup;

async function resolveV5ModelUri(
  regionId: RegionPackId,
  key: V5StageKey,
): Promise<string | null> {
  if (key === 'kingdom' || key === 'common_mammals') {
    for (const storageId of getRegionModelStorageCandidates(regionId)) {
      const uri = await resolveRegionalModelUri(storageId as RegionPackId, getV5GlobalRelativePath(key));
      if (uri) return uri;
    }
    return null;
  }

  for (const storageId of getRegionModelStorageCandidates(regionId)) {
    const uri = await resolveRegionalModelUri(
      storageId as RegionPackId,
      getV5RegionalRelativePath(key),
    );
    if (uri) return uri;
  }
  return null;
}

async function loadV5Model(
  regionId: RegionPackId,
  key: V5StageKey,
): Promise<{ config: ClassificationModelConfig; model: Awaited<ReturnType<typeof getCachedTfliteModel>> }> {
  const config = getV5ModelConfig(key);
  const uri = await resolveV5ModelUri(regionId, key);
  if (uri) {
    return { config, model: await getCachedTfliteModelFromUri(uri) };
  }
  return { config, model: await getCachedTfliteModel(config.model) };
}

export async function runV5Stage(
  regionId: RegionPackId,
  key: V5StageKey,
  imageUri: string,
): Promise<{ predictions: ClassificationPrediction[] }> {
  const { config, model } = await loadV5Model(regionId, key);
  const { predictions } = await classifyStillImage(imageUri, model, config);
  return { predictions };
}

export function isV5CaptureRegion(regionId: RegionPackId): boolean {
  return v5CascadeRegionForAppRegion(regionId) != null;
}
