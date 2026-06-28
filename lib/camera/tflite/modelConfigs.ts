import mobilevitMeta from '@/assets/tflite/near_nature_app_bundle/routing_capture/mobilevit_routing/tflite/labels.json';
import efficientnetMeta from '@/assets/tflite/preview_models/efficientnet_b0_imagenet/tflite/labels.json';

import type { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';
import type { SpecialistModelDefinition } from '@/lib/camera/mobilenet/specialistModelRegistry';
import {
  MOBILENET_PREVIEW_IMAGENET_MEAN,
  MOBILENET_PREVIEW_IMAGENET_STD,
} from '@/lib/camera/mobilenet/modelConfig';

const IMAGENET_NORM = {
  mean: [...MOBILENET_PREVIEW_IMAGENET_MEAN] as [number, number, number],
  std: [...MOBILENET_PREVIEW_IMAGENET_STD] as [number, number, number],
};

const mobilevitLabels: string[] = (mobilevitMeta as { labels: { name: string }[] }).labels.map(
  (entry) => entry.name,
);

const efficientnetLabels: string[] = (efficientnetMeta as { labels: { name: string }[] }).labels.map(
  (entry) => entry.name,
);

/** Post-capture MobileViT routing (256×256, sigmoid → top-3 groups). */
export const mobilevitRoutingCaptureConfig: ClassificationModelConfig = {
  id: 'mobilevit-routing',
  name: 'MobileViT Routing',
  task: 'classification',
  labels: mobilevitLabels,
  model: require('@/assets/tflite/near_nature_app_bundle/routing_capture/mobilevit_routing/tflite/routing_classifier.tflite'),
  input: {
    width: 256,
    height: 256,
    pixelFormat: 'rgb',
    dataType: 'float32',
    normalization: IMAGENET_NORM,
  },
  targetFps: 1,
  topK: 3,
  outputType: 'float',
  confidenceMode: 'probability',
  directLabelIndex: true,
  outputActivation: 'sigmoid',
};

/** Live camera preview (ImageNet EfficientNet B0). */
export const efficientnetB0LivePreviewConfig: ClassificationModelConfig = {
  id: 'efficientnet-b0-preview',
  name: 'EfficientNet B0 (ImageNet)',
  task: 'classification',
  labels: efficientnetLabels,
  model: require('@/assets/tflite/preview_models/efficientnet_b0_imagenet/tflite/efficientnet_b0_imagenet1k.tflite'),
  input: {
    width: 224,
    height: 224,
    pixelFormat: 'rgb',
    dataType: 'float32',
    normalization: IMAGENET_NORM,
  },
  targetFps: 2,
  topK: 1,
  outputType: 'float',
  confidenceMode: 'softmax',
  directLabelIndex: true,
  softmaxOutput: true,
  supportsFrameSkipping: true,
  frameSkipInterval: 12,
  frameSkipTargetFps: 2,
};

export function specialistCaptureConfig(
  specialist: SpecialistModelDefinition,
): ClassificationModelConfig {
  return {
    id: `specialist-${specialist.assetFolder}`,
    name: specialist.displayName,
    task: 'classification',
    labels: [...specialist.labelLookup],
    model: 0,
    input: {
      width: 224,
      height: 224,
      pixelFormat: 'rgb',
      dataType: 'float32',
      normalization: IMAGENET_NORM,
    },
    targetFps: 1,
    topK: 3,
    outputType: 'float',
    confidenceMode: 'softmax',
    directLabelIndex: true,
    softmaxOutput: true,
  };
}

export function modelSupportsFrameSkipping(config: ClassificationModelConfig): boolean {
  return config.supportsFrameSkipping === true;
}
