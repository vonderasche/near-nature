import labelsJson from '@/assets/tflite/v18/tflite/labels.json';
import modelInfoJson from '@/assets/tflite/v18/tflite/model_info.json';

import {
  V18_LABELS_RELATIVE_PATH,
  V18_MODEL_INFO_RELATIVE_PATH,
  V18_TFLITE_FP16_RELATIVE_PATH,
  V18_TFLITE_RELATIVE_PATH,
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
const INPUT_SIZE = MODEL_INFO.inputSize ?? 240;
const RESIZE_SHORT_EDGE =
  MODEL_INFO.resizeShortEdge ?? MODEL_INFO.preprocess?.resizeShortEdge ?? INPUT_SIZE + 15;

export const V18_FAMILY_CONFIDENCE_THRESHOLD = 0.45;

export function getV18ModelRelativePath(): string {
  const fileName = MODEL_INFO.tfliteFile ?? 'v18.tflite';
  return `v18/tflite/${fileName}`;
}

export function getV18FallbackModelRelativePath(): string {
  const primary = getV18ModelRelativePath();
  if (primary.endsWith('v18_fp16.tflite')) {
    return V18_TFLITE_RELATIVE_PATH;
  }
  return V18_TFLITE_FP16_RELATIVE_PATH;
}

export function getV18CaptureBundleRelativePaths(): readonly string[] {
  return [V18_TFLITE_RELATIVE_PATH, V18_LABELS_RELATIVE_PATH, V18_MODEL_INFO_RELATIVE_PATH];
}

export function getV18ModelConfig(): ClassificationModelConfig {
  return {
    id: 'v18-capture',
    name: 'V18 family',
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
