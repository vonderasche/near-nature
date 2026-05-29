import { loadTensorflowModel, type TensorflowModel } from 'react-native-fast-tflite';

import type { MobileNetPredictionScore } from '@/lib/camera/mobilenet/parseMobileNetOutput';
import { parseMobileNetTop3 } from '@/lib/camera/mobilenet/parseMobileNetOutput';

const modelCache = new Map<number, Promise<TensorflowModel>>();

export function getCachedTfliteModel(modelAsset: number): Promise<TensorflowModel> {
  const existing = modelCache.get(modelAsset);
  if (existing) return existing;

  const pending = loadTensorflowModel(modelAsset, []);
  modelCache.set(modelAsset, pending);
  return pending;
}

export async function runTfliteTop3(
  model: TensorflowModel,
  input: Float32Array,
): Promise<MobileNetPredictionScore[]> {
  const outputs = await model.run([input.buffer as ArrayBuffer]);
  const raw = outputs[0];
  if (raw == null) {
    throw new Error('The on-device model returned no output.');
  }
  return parseMobileNetTop3(raw);
}
