import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'jpeg-js';
import type { TfliteModel } from 'react-native-fast-tflite';

import type {
  ClassificationModelConfig,
  ClassificationPrediction,
} from '@/lib/camera/tflite/modelTypes';
import { ensureLocalImageUri } from '@/lib/camera/tflite/ensureLocalImageUri';
import { mapRawPredictions } from '@/lib/camera/tflite/tfliteClassification';

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function buildModelInputBuffer(
  rgba: Uint8Array,
  width: number,
  height: number,
  config: ClassificationModelConfig,
): ArrayBuffer {
  const pixelCount = width * height;
  const out = new Float32Array(pixelCount * 3);
  const norm = config.input.normalization;

  for (let i = 0; i < pixelCount; i += 1) {
    const rgbaOffset = i * 4;
    const rgbOffset = i * 3;
    const r = (rgba[rgbaOffset] ?? 0) / 255;
    const g = (rgba[rgbaOffset + 1] ?? 0) / 255;
    const b = (rgba[rgbaOffset + 2] ?? 0) / 255;

    if (config.input.dataType === 'float32' && norm) {
      out[rgbOffset] = (r - norm.mean[0]) / norm.std[0];
      out[rgbOffset + 1] = (g - norm.mean[1]) / norm.std[1];
      out[rgbOffset + 2] = (b - norm.mean[2]) / norm.std[2];
    } else if (config.input.dataType === 'float32') {
      out[rgbOffset] = r;
      out[rgbOffset + 1] = g;
      out[rgbOffset + 2] = b;
    } else {
      out[rgbOffset] = rgba[rgbaOffset] ?? 0;
      out[rgbOffset + 1] = rgba[rgbaOffset + 1] ?? 0;
      out[rgbOffset + 2] = rgba[rgbaOffset + 2] ?? 0;
    }
  }

  return out.buffer;
}

async function loadRgbaFromUri(
  imageUri: string,
  width: number,
  height: number,
): Promise<{ data: Uint8Array; width: number; height: number }> {
  const resized = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width, height } }],
    { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true },
  );

  if (!resized.base64) {
    throw new Error('Could not read resized image data.');
  }

  const bytes = base64ToUint8Array(resized.base64);
  const decoded = decode(bytes, { useTArray: true });

  return {
    data: decoded.data,
    width: decoded.width,
    height: decoded.height,
  };
}

export type StillImageClassificationResult = {
  predictions: ClassificationPrediction[];
  preprocessMs: number;
  inferenceMs: number;
};

export async function classifyStillImage(
  imageUri: string,
  model: TfliteModel,
  config: ClassificationModelConfig,
): Promise<StillImageClassificationResult> {
  const localUri = await ensureLocalImageUri(imageUri);

  const preprocessStart = performance.now();
  const { data, width, height } = await loadRgbaFromUri(
    localUri,
    config.input.width,
    config.input.height,
  );
  const inputBuffer = buildModelInputBuffer(data, width, height, config);
  const preprocessMs = performance.now() - preprocessStart;

  const inferenceStart = performance.now();
  let outputs: ArrayBuffer[];
  try {
    outputs = model.runSync([inputBuffer]);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Model inference failed (${config.name}): ${detail}`);
  }
  const inferenceMs = performance.now() - inferenceStart;

  const outputBuffer = outputs[0];
  if (outputBuffer == null) {
    throw new Error('Model returned no output.');
  }

  const scores = new Float32Array(outputBuffer);
  const raw = rawPredictionsFromScores(scores, config);

  const predictions = mapRawPredictions(raw, config.labels, {
    directLabelIndex: config.directLabelIndex,
    confidenceMode: config.confidenceMode,
    softmaxOutput: config.softmaxOutput,
    topK: config.topK,
  });

  return { predictions, preprocessMs, inferenceMs };
}

function sigmoid(value: number): number {
  if (value >= 0) {
    const z = Math.exp(-value);
    return 1 / (1 + z);
  }
  const z = Math.exp(value);
  return z / (1 + z);
}

function rawPredictionsFromScores(
  scores: Float32Array,
  config: ClassificationModelConfig,
): { index: number; score: number }[] {
  const topK = config.topK ?? 3;

  if (config.outputActivation === 'sigmoid') {
    return Array.from(scores, (score, index) => ({
      index,
      score: sigmoid(score),
    }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  return topRawPredictions(scores, topK);
}

function topRawPredictions(
  scores: Float32Array,
  topK: number,
): { index: number; score: number }[] {
  const k = Math.min(topK, scores.length);
  const heap: { index: number; score: number }[] = [];

  for (let index = 0; index < scores.length; index += 1) {
    const score = scores[index] ?? 0;
    if (heap.length < k) {
      heap.push({ index, score });
      if (heap.length === k) {
        heap.sort((a, b) => a.score - b.score);
      }
      continue;
    }

    if (score <= (heap[0]?.score ?? -Infinity)) {
      continue;
    }

    heap[0] = { index, score };
    heap.sort((a, b) => a.score - b.score);
  }

  return heap.sort((a, b) => b.score - a.score);
}
