import {
  V3_IMAGENET_NORM,
  V3_INPUT_224,
  V3_MODEL_ASSETS,
  V3_SCENE_GATE_LABELS,
} from '@/lib/camera/tflite/v3/v3CascadeConfig';
import type { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';

/** Live preview: scene gate only (organism vs not_organism), ~3 FPS. */
export const v3SceneGatePreviewConfig: ClassificationModelConfig = {
  id: 'v3-scene-gate-preview',
  name: 'V3 Scene Gate',
  task: 'classification',
  labels: [...V3_SCENE_GATE_LABELS],
  model: V3_MODEL_ASSETS.sceneGate,
  input: {
    width: V3_INPUT_224,
    height: V3_INPUT_224,
    pixelFormat: 'rgb',
    dataType: 'float32',
    normalization: V3_IMAGENET_NORM,
  },
  targetFps: 3,
  topK: 2,
  outputType: 'float',
  confidenceMode: 'softmax',
  directLabelIndex: true,
  softmaxOutput: true,
  supportsFrameSkipping: true,
  frameSkipInterval: 8,
  frameSkipTargetFps: 3,
};
