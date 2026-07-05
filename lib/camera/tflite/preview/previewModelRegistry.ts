import {
  MOBILENET_PREVIEW_IMAGENET_MEAN,
  MOBILENET_PREVIEW_IMAGENET_STD,
} from '@/lib/camera/mobilenet/modelConfig';
import type { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';
import type { ImageNormalization } from '@/lib/camera/tflite/modelTypes';

import kingdomLabelsJson from '@/assets/tflite/preview_models/kingdom/tflite/labels.json';
import kingdomGlobalLabelsJson from '@/assets/tflite/preview_models/kingdom_global/tflite/labels.json';

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

/** Ordered list — camera preview toggle cycles through this array. */
export const PREVIEW_MODEL_DEFINITIONS: PreviewModelDefinition[] = [
  buildClassificationConfig({
    id: 'kingdom_global',
    shortName: 'Kingdom',
    description: 'Global plant / animal / fungi (v6 kingdom head)',
    kind: 'kingdom_global',
    labels: labelsFromBundle(kingdomGlobalLabelsJson as { labels: { index: number; name: string }[] }),
    modelAsset: require('@/assets/tflite/preview_models/kingdom_global/tflite/kingdom.tflite'),
    topK: 5,
    targetFps: 3,
    frameSkipInterval: 8,
    frameSkipTargetFps: 3,
  }),
  buildClassificationConfig({
    id: 'kingdom',
    shortName: 'Kingdom (legacy)',
    description: 'Plant / animal / fungi (v4 kingdom head)',
    kind: 'kingdom',
    labels: labelsFromBundle(kingdomLabelsJson as { labels: { index: number; name: string }[] }),
    modelAsset: require('@/assets/tflite/preview_models/kingdom/tflite/kingdom.tflite'),
    topK: 4,
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
