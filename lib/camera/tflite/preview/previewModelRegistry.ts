import {
  MOBILENET_PREVIEW_IMAGENET_MEAN,
  MOBILENET_PREVIEW_IMAGENET_STD,
} from '@/lib/camera/mobilenet/modelConfig';
import type { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';
import type { ImageNormalization } from '@/lib/camera/tflite/modelTypes';

import sceneGateLabelsJson from '@/assets/tflite/preview_models/scene_gate/tflite/labels.json';
import kingdomLabelsJson from '@/assets/tflite/preview_models/kingdom/tflite/labels.json';
import routingPreviewLabelsJson from '@/assets/tflite/preview_models/routing_preview_v1/tflite/labels.json';
import imagenetLabelsJson from '@/assets/tflite/preview_models/shared/imagenet1k_labels.json';

import { labelsFromBundle } from '@/lib/camera/tflite/preview/parseLabelsBundle';
import {
  type PreviewModelId,
  type PreviewModelKind,
} from '@/lib/camera/tflite/preview/previewModelIds';
import {
  DEFAULT_PREVIEW_MODEL_ID,
  parsePreviewModelId,
  nextPreviewModelId,
  previewModelCaption,
  PREVIEW_MODEL_IDS,
} from '@/lib/camera/tflite/preview/previewModelSelection';

export {
  DEFAULT_PREVIEW_MODEL_ID,
  parsePreviewModelId,
  nextPreviewModelId,
  previewModelCaption,
  PREVIEW_MODEL_IDS,
};
export type { PreviewModelId, PreviewModelKind };

const IMAGENET_NORM: ImageNormalization = {
  mean: [...MOBILENET_PREVIEW_IMAGENET_MEAN] as [number, number, number],
  std: [...MOBILENET_PREVIEW_IMAGENET_STD] as [number, number, number],
};

const INPUT_224 = 224;

export type PreviewModelDefinition = {
  id: PreviewModelId;
  /** Short label for the camera toggle. */
  shortName: string;
  description: string;
  kind: PreviewModelKind;
  labels: readonly string[];
  modelAsset: number;
  config: ClassificationModelConfig;
};

function buildClassificationConfig(
  def: Omit<PreviewModelDefinition, 'config'> & {
    topK: number;
    targetFps: number;
    frameSkipInterval: number;
    frameSkipTargetFps: number;
    outputActivation?: 'softmax' | 'sigmoid';
  },
): PreviewModelDefinition {
  const {
    topK,
    targetFps,
    frameSkipInterval,
    frameSkipTargetFps,
    outputActivation = 'softmax',
    ...rest
  } = def;

  return {
    ...rest,
    config: {
      id: `preview-${rest.id}`,
      name: rest.shortName,
      task: 'classification',
      labels: [...rest.labels],
      model: rest.modelAsset,
      input: {
        width: INPUT_224,
        height: INPUT_224,
        pixelFormat: 'rgb',
        dataType: 'float32',
        normalization: IMAGENET_NORM,
      },
      targetFps,
      topK,
      outputType: 'float',
      outputActivation,
      confidenceMode: 'probability',
      directLabelIndex: true,
      softmaxOutput: outputActivation === 'softmax',
      supportsFrameSkipping: true,
      frameSkipInterval,
      frameSkipTargetFps,
    },
  };
}

const IMAGENET_LABELS = labelsFromBundle(imagenetLabelsJson as { labels: { index: number; name: string }[] });

/** Ordered list — camera preview toggle cycles through this array. */
export const PREVIEW_MODEL_DEFINITIONS: PreviewModelDefinition[] = [
  buildClassificationConfig({
    id: 'scene_gate',
    shortName: 'Scene',
    description: 'Organism vs not (trained gate)',
    kind: 'scene_gate',
    labels: labelsFromBundle(sceneGateLabelsJson as { labels: { index: number; name: string }[] }),
    modelAsset: require('@/assets/tflite/preview_models/scene_gate/tflite/scene_gate.tflite'),
    topK: 2,
    targetFps: 3,
    frameSkipInterval: 8,
    frameSkipTargetFps: 3,
  }),
  buildClassificationConfig({
    id: 'kingdom',
    shortName: 'Kingdom',
    description: 'Plant / animal / fungi (trained kingdom head)',
    kind: 'kingdom',
    labels: labelsFromBundle(kingdomLabelsJson as { labels: { index: number; name: string }[] }),
    modelAsset: require('@/assets/tflite/preview_models/kingdom/tflite/kingdom.tflite'),
    topK: 4,
    targetFps: 3,
    frameSkipInterval: 8,
    frameSkipTargetFps: 3,
  }),
  buildClassificationConfig({
    id: 'routing_preview_v1',
    shortName: 'Route',
    description: '20-class routing preview (Bird, Tree, …)',
    kind: 'plain',
    labels: labelsFromBundle(routingPreviewLabelsJson as { labels: { index: number; name: string }[] }),
    modelAsset: require('@/assets/tflite/preview_models/routing_preview_v1/tflite/preview_classifier.tflite'),
    topK: 3,
    targetFps: 2,
    frameSkipInterval: 10,
    frameSkipTargetFps: 2,
  }),
  buildClassificationConfig({
    id: 'efficientnet_b0_imagenet',
    shortName: 'EN-B0',
    description: 'EfficientNet B0 ImageNet 1k (Google pretrained)',
    kind: 'plain',
    labels: IMAGENET_LABELS,
    modelAsset: require('@/assets/tflite/preview_models/efficientnet_b0_imagenet/tflite/efficientnet_b0_imagenet1k.tflite'),
    topK: 3,
    targetFps: 2,
    frameSkipInterval: 12,
    frameSkipTargetFps: 2,
  }),
  buildClassificationConfig({
    id: 'efficientnet_lite0_imagenet',
    shortName: 'EN-L0',
    description: 'EfficientNet-Lite0 ImageNet 1k (Google MediaPipe)',
    kind: 'plain',
    labels: IMAGENET_LABELS,
    modelAsset: require('@/assets/tflite/preview_models/efficientnet_lite0_imagenet/tflite/efficientnet_lite0.tflite'),
    topK: 3,
    targetFps: 3,
    frameSkipInterval: 8,
    frameSkipTargetFps: 3,
  }),
  buildClassificationConfig({
    id: 'efficientnet_lite2_imagenet',
    shortName: 'EN-L2',
    description: 'EfficientNet-Lite2 ImageNet 1k (Google MediaPipe)',
    kind: 'plain',
    labels: IMAGENET_LABELS,
    modelAsset: require('@/assets/tflite/preview_models/efficientnet_lite2_imagenet/tflite/efficientnet_lite2.tflite'),
    topK: 3,
    targetFps: 2,
    frameSkipInterval: 10,
    frameSkipTargetFps: 2,
  }),
  buildClassificationConfig({
    id: 'mobilenet_v2_imagenet',
    shortName: 'MN-V2',
    description: 'MobileNet V2 ImageNet 1k (Google TFLite hosted)',
    kind: 'plain',
    labels: IMAGENET_LABELS,
    modelAsset: require('@/assets/tflite/preview_models/mobilenet_v2_imagenet/tflite/mobilenet_v2_1.0_224.tflite'),
    topK: 3,
    targetFps: 3,
    frameSkipInterval: 8,
    frameSkipTargetFps: 3,
  }),
];

const BY_ID = Object.fromEntries(
  PREVIEW_MODEL_DEFINITIONS.map((entry) => [entry.id, entry]),
) as Record<PreviewModelId, PreviewModelDefinition>;

export function getPreviewModelDefinition(id: PreviewModelId): PreviewModelDefinition {
  const entry = BY_ID[id];
  if (!entry) {
    throw new Error(`Unknown preview model id: ${id}`);
  }
  return entry;
}

export function getPreviewModelConfig(id: PreviewModelId): ClassificationModelConfig {
  return getPreviewModelDefinition(id).config;
}

/** Metro asset module ids for cache eviction (one active preview model at a time). */
export function allPreviewModelAssets(): number[] {
  return PREVIEW_MODEL_DEFINITIONS.map((entry) => entry.modelAsset);
}

export function listPreviewModelsForPicker(): Pick<
  PreviewModelDefinition,
  'id' | 'shortName' | 'description'
>[] {
  return PREVIEW_MODEL_DEFINITIONS.map(({ id, shortName, description }) => ({
    id,
    shortName,
    description,
  }));
}
