import sceneGateLabelsJson from '@/assets/tflite/preview_models/scene_gate/tflite/labels.json';
import kingdomLabelsJson from '@/assets/tflite/preview_models/kingdom/tflite/labels.json';

import {
  MOBILENET_PREVIEW_IMAGENET_MEAN,
  MOBILENET_PREVIEW_IMAGENET_STD,
} from '@/lib/camera/mobilenet/modelConfig';
import type { ImageNormalization } from '@/lib/camera/tflite/modelTypes';
import { labelsFromBundle } from '@/lib/camera/tflite/preview/parseLabelsBundle';

export { formatMvpSceneGatePreviewLabel, MVP_SCENE_GATE_ORGANISM_MAYBE_THRESHOLD, MVP_SCENE_GATE_ORGANISM_THRESHOLD } from '@/lib/camera/tflite/mvp/mvpSceneGateDisplay';

export {
  MVP_KINGDOM_TOP1_MARGIN,
  MVP_KINGDOM_TOP1_THRESHOLD,
} from '@/lib/camera/tflite/preview/kingdomPreviewThresholds';

export const MVP_INPUT_224 = 224;
export const MVP_INPUT_240 = 240;
export const MVP_B1_RESIZE_SHORT_EDGE = 255;

export const MVP_IMAGENET_NORM: ImageNormalization = {
  mean: [...MOBILENET_PREVIEW_IMAGENET_MEAN] as [number, number, number],
  std: [...MOBILENET_PREVIEW_IMAGENET_STD] as [number, number, number],
};

export const MVP_SCENE_GATE_LABELS = labelsFromBundle(
  sceneGateLabelsJson as { labels: { index: number; name: string }[] },
);
export const MVP_KINGDOM_LABELS = labelsFromBundle(
  kingdomLabelsJson as { labels: { index: number; name: string }[] },
);
export const MVP_ORGANISM_LABEL = 'organism';
export const MVP_NOT_ORGANISM_LABEL = 'not_organism';

/** @deprecated Prefer `getPreviewModelDefinition('scene_gate').modelAsset` */
export const MVP_MODEL_ASSETS = {
  sceneGate: require('@/assets/tflite/preview_models/scene_gate/tflite/scene_gate.tflite'),
  kingdom: require('@/assets/tflite/preview_models/kingdom/tflite/kingdom.tflite'),
} as const;
