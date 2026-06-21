import efficientnetMeta from './tflite/labels.json';
import { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';

const IMAGENET_MEAN: [number, number, number] = [0.485, 0.456, 0.406];
const IMAGENET_STD: [number, number, number] = [0.229, 0.224, 0.225];

const efficientnetLabels: string[] = efficientnetMeta.labels.map((entry) => entry.name);

/** ImageNet-1K live preview (does not route to iNat specialists). */
export const efficientnetB0Preview: ClassificationModelConfig = {
  id: 'efficientnet-b0-preview',
  name: 'EfficientNet B0 (ImageNet)',
  task: 'classification',
  labels: efficientnetLabels,
  model: require('../../assets/tflite/efficientnet_b0/efficientnet_b0_imagenet1k.tflite'),
  input: {
    width: 224,
    height: 224,
    pixelFormat: 'rgb',
    dataType: 'float32',
    normalization: { mean: IMAGENET_MEAN, std: IMAGENET_STD },
  },
  targetFps: 2,
  topK: 3,
  outputType: 'float',
  confidenceMode: 'softmax',
  directLabelIndex: true,
  routesToSpecialist: false,
  supportsFrameSkipping: true,
  frameSkipInterval: 12,
  frameSkipTargetFps: 2,
};
