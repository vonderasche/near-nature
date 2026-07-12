import { getCachedTfliteModel } from '@/lib/camera/tflite/cachedModels';
import type { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';
import { classifyStillImage } from '@/lib/camera/tflite/staticImageClassifier';
import type { ClassificationPrediction } from '@/lib/camera/tflite/modelTypes';
import type { V13StageKey } from '@/lib/camera/tflite/v13/v13Groups';
import { getV13ModelConfig } from '@/lib/camera/tflite/v13/v13ModelRegistry';

async function loadV13Model(
  key: V13StageKey,
): Promise<{ config: ClassificationModelConfig; model: Awaited<ReturnType<typeof getCachedTfliteModel>> }> {
  const config = getV13ModelConfig(key);
  return { config, model: await getCachedTfliteModel(config.model) };
}

export async function runV13Stage(
  key: V13StageKey,
  imageUri: string,
): Promise<{ predictions: ClassificationPrediction[] }> {
  const { config, model } = await loadV13Model(key);
  const { predictions } = await classifyStillImage(imageUri, model, config);
  return { predictions };
}

export function isV13CaptureAvailable(): boolean {
  return true;
}
