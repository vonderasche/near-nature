import type { TfliteModel } from 'react-native-fast-tflite';

import { loadBundledTfliteModel } from '@/lib/camera/tflite/loadBundledTfliteModel';
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

const modelCache = new Map<number, Promise<TfliteModel>>();
const specialistModelPromises: Partial<Record<SpecialistAssetFolder, Promise<TfliteModel>>> = {};
let mobilevitRoutingModelPromise: Promise<TfliteModel> | null = null;

export function getCachedTfliteModel(modelAsset: number): Promise<TfliteModel> {
  const existing = modelCache.get(modelAsset);
  if (existing) return existing;

  const pending = loadBundledTfliteModel(modelAsset, []);
  modelCache.set(modelAsset, pending);
  return pending;
}

export async function loadMobileVitRoutingModel(): Promise<TfliteModel> {
  if (!mobilevitRoutingModelPromise) {
    mobilevitRoutingModelPromise = loadBundledTfliteModel(mobilevitRoutingCaptureConfig.model, []);
  }
  return mobilevitRoutingModelPromise;
}

export async function loadSpecialistModel(
  assetFolder: SpecialistAssetFolder,
): Promise<TfliteModel> {
  if (!specialistModelPromises[assetFolder]) {
    const specialist = getSpecialistDefinition(assetFolder);
    if (!specialist) {
      throw new Error(`Missing specialist model for ${assetFolder}.`);
    }
    specialistModelPromises[assetFolder] = loadBundledTfliteModel(specialist.model, []);
  }
  return specialistModelPromises[assetFolder]!;
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
