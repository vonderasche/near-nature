import labelsJson from '@/assets/tflite/v16/tflite/labels.json';
import modelInfoJson from '@/assets/tflite/v16/tflite/model_info.json';

import {
  V16_LABELS_RELATIVE_PATH,
  V16_MODEL_INFO_RELATIVE_PATH,
  V16_TFLITE_FP16_RELATIVE_PATH,
  V16_TFLITE_RELATIVE_PATH,
} from '@/constants/modelBundles';
import { labelsFromBundle } from '@/lib/camera/tflite/preview/parseLabelsBundle';
import type { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';

type LabelsFile = { labels: { index: number; name: string }[] };
type ModelInfoFile = {
  inputSize: number;
  resizeShortEdge?: number;
  tfliteFile?: string;
  normalization: { mean: number[]; std: number[] };
  preprocess?: { mode?: string; resizeShortEdge?: number; cropSize?: number };
};

const MODEL_INFO = modelInfoJson as ModelInfoFile;
const LABELS = labelsFromBundle(labelsJson as LabelsFile);
const INPUT_SIZE = MODEL_INFO.inputSize ?? 260;
const RESIZE_SHORT_EDGE =
  MODEL_INFO.resizeShortEdge ?? MODEL_INFO.preprocess?.resizeShortEdge ?? INPUT_SIZE + 28;

export const V16_FAMILY_CONFIDENCE_THRESHOLD = 0.45;

export function getV16ModelRelativePath(): string {
  const fileName = MODEL_INFO.tfliteFile ?? 'v16.tflite';
  return `v16/tflite/${fileName}`;
}

export function getV16FallbackModelRelativePath(): string {
  const primary = getV16ModelRelativePath();
  if (primary.endsWith('v16_fp16.tflite')) {
    return V16_TFLITE_RELATIVE_PATH;
  }
  return V16_TFLITE_FP16_RELATIVE_PATH;
}

export function getV16CaptureBundleRelativePaths(): readonly string[] {
  return [V16_TFLITE_RELATIVE_PATH, V16_LABELS_RELATIVE_PATH, V16_MODEL_INFO_RELATIVE_PATH];
}

export function getV16ModelConfig(): ClassificationModelConfig {
  return {
    id: 'v16-capture',
    name: 'V16 family',
    task: 'classification',
    labels: [...LABELS],
    model: 0,
    input: {
      width: INPUT_SIZE,
      height: INPUT_SIZE,
      pixelFormat: 'rgb',
      dataType: 'float32',
      normalization: {
        mean: MODEL_INFO.normalization.mean as [number, number, number],
        std: MODEL_INFO.normalization.std as [number, number, number],
      },
      preprocessMode: 'resize_short_edge_then_center_crop',
      resizeShortEdge: RESIZE_SHORT_EDGE,
    },
    targetFps: 1,
    topK: 3,
    outputType: 'float',
    confidenceMode: 'probability',
    directLabelIndex: true,
    softmaxOutput: true,
    outputActivation: 'softmax',
  };
}
