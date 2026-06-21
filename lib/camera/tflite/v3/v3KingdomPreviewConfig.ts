import {
  V3_IMAGENET_NORM,
  V3_INPUT_224,
  V3_KINGDOM_LABELS,
  V3_MODEL_ASSETS,
} from '@/lib/camera/tflite/v3/v3CascadeConfig';
import type { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';

/** Live preview: kingdom classifier (plantae / animalia / fungi / uncertain), ~3 FPS. */
export const v3KingdomPreviewConfig: ClassificationModelConfig = {
  id: 'v3-kingdom-preview',
  name: 'V3 Kingdom',
  task: 'classification',
  labels: [...V3_KINGDOM_LABELS],
  model: V3_MODEL_ASSETS.kingdom,
  input: {
    width: V3_INPUT_224,
    height: V3_INPUT_224,
    pixelFormat: 'rgb',
    dataType: 'float32',
    normalization: V3_IMAGENET_NORM,
  },
  targetFps: 3,
  topK: 4,
  outputType: 'float',
  confidenceMode: 'softmax',
  directLabelIndex: true,
  softmaxOutput: true,
  supportsFrameSkipping: true,
  frameSkipInterval: 8,
  frameSkipTargetFps: 3,
};
