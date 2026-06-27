import {
  MVP_IMAGENET_NORM,
  MVP_INPUT_224,
  MVP_MODEL_ASSETS,
  MVP_SCENE_GATE_LABELS,
} from '@/lib/camera/tflite/mvp/mvpCaptureConfig';
import type { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';

/** Live preview: scene gate (not_organism / organism), ~3 FPS. */
export const mvpSceneGatePreviewConfig: ClassificationModelConfig = {
  id: 'mvp-scene-gate-preview',
  name: 'MVP Scene Gate',
  task: 'classification',
  labels: [...MVP_SCENE_GATE_LABELS],
  model: MVP_MODEL_ASSETS.sceneGate,
  input: {
    width: MVP_INPUT_224,
    height: MVP_INPUT_224,
    pixelFormat: 'rgb',
    dataType: 'float32',
    normalization: MVP_IMAGENET_NORM,
  },
  targetFps: 3,
  topK: 2,
  outputType: 'float',
  outputActivation: 'softmax',
  confidenceMode: 'probability',
  directLabelIndex: true,
  supportsFrameSkipping: true,
  frameSkipInterval: 8,
  frameSkipTargetFps: 3,
};
