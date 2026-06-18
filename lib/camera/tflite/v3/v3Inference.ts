import type { TfliteModel } from 'react-native-fast-tflite';

import { devLog } from '@/lib/devLog';
import { mapRawPredictions } from '@/lib/camera/tflite/tfliteClassification';
import type { ClassificationPrediction } from '@/lib/camera/tflite/modelTypes';

export type V3StepPrediction = ClassificationPrediction & {
  classIndex: number;
};

export type V3InferenceResult = {
  predictions: V3StepPrediction[];
  inferenceMs: number;
};

export function runV3ClassificationBuffer(
  model: TfliteModel,
  inputBuffer: ArrayBuffer,
  labels: readonly string[],
  topK = 3,
  stepName?: string,
): V3StepPrediction[] {
  return runV3ClassificationBufferDetailed(model, inputBuffer, labels, topK, stepName).predictions;
}

export function runV3ClassificationBufferDetailed(
  model: TfliteModel,
  inputBuffer: ArrayBuffer,
  labels: readonly string[],
  topK = 3,
  stepName?: string,
): V3InferenceResult {
  const inferenceStart = performance.now();
  let outputs: ArrayBuffer[];
  try {
    outputs = model.runSync([inputBuffer]);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`V3 model inference failed: ${detail}`);
  }
  const inferenceMs = performance.now() - inferenceStart;

  const outputBuffer = outputs[0];
  if (outputBuffer == null) {
    throw new Error('V3 model returned no output.');
  }

  const scores = new Float32Array(outputBuffer);
  const raw = Array.from(scores, (score, index) => ({ index, score }));

  const predictions = mapRawPredictions(raw, [...labels], {
    directLabelIndex: true,
    confidenceMode: 'softmax',
    topK,
  }).map((row) => ({
    ...row,
    classIndex: labels.indexOf(row.label),
  }));

  if (stepName) {
    const top = predictions[0];
    devLog(
      `[v3] ${stepName} inference ${inferenceMs.toFixed(1)}ms`,
      top ? `${top.label} ${(top.confidence * 100).toFixed(1)}%` : 'no prediction',
    );
  }

  return { predictions, inferenceMs };
}

export function topPrediction(
  predictions: readonly V3StepPrediction[],
): V3StepPrediction | null {
  return predictions[0] ?? null;
}

export function predictionConfidence(
  predictions: readonly V3StepPrediction[],
  label: string,
): number {
  return predictions.find((row) => row.label === label)?.confidence ?? 0;
}
