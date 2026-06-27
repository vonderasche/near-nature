import {
  MVP_IMAGENET_NORM,
  MVP_INPUT_224,
  MVP_KINGDOM_LABELS,
  MVP_MODEL_ASSETS,
} from '@/lib/camera/tflite/mvp/mvpCaptureConfig';
import type { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';

/** Live preview: kingdom classifier (plantae / animalia / fungi / uncertain), ~3 FPS. */
export const mvpKingdomPreviewConfig: ClassificationModelConfig = {
  id: 'mvp-kingdom-preview',
  name: 'MVP Kingdom',
  task: 'classification',
  labels: [...MVP_KINGDOM_LABELS],
  model: MVP_MODEL_ASSETS.kingdom,
  input: {
    width: MVP_INPUT_224,
    height: MVP_INPUT_224,
    pixelFormat: 'rgb',
    dataType: 'float32',
    normalization: MVP_IMAGENET_NORM,
  },
  targetFps: 3,
  topK: 4,
  outputType: 'float',
  outputActivation: 'softmax',
  confidenceMode: 'probability',
  directLabelIndex: true,
  supportsFrameSkipping: true,
  frameSkipInterval: 8,
  frameSkipTargetFps: 3,
};
