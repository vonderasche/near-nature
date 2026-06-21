import mobilevitMeta from './tflite/labels.json';
import { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';

const IMAGENET_MEAN: [number, number, number] = [0.485, 0.456, 0.406];
const IMAGENET_STD: [number, number, number] = [0.229, 0.224, 0.225];

const mobilevitLabels: string[] = mobilevitMeta.labels.map((entry) => entry.name);

/** Post-capture routing classifier (256×256, sigmoid logits → top-3 groups). */
export const mobilevitRoutingCapture: ClassificationModelConfig = {
  id: 'mobilevit-routing',
  name: 'MobileViT Routing',
  task: 'classification',
  labels: mobilevitLabels,
  model: require('../../assets/tflite/mobilevit_routing/routing_classifier.tflite'),
  input: {
    width: 256,
    height: 256,
    pixelFormat: 'rgb',
    dataType: 'float32',
    normalization: { mean: IMAGENET_MEAN, std: IMAGENET_STD },
  },
  targetFps: 1,
  topK: 3,
  outputType: 'float',
  confidenceMode: 'probability',
  directLabelIndex: true,
  outputActivation: 'sigmoid',
  routesToSpecialist: true,
  showInCameraPicker: false,
};
