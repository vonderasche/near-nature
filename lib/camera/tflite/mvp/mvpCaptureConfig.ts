import {
  MOBILENET_PREVIEW_IMAGENET_MEAN,
  MOBILENET_PREVIEW_IMAGENET_STD,
} from '@/lib/camera/mobilenet/modelConfig';
import type { ImageNormalization } from '@/lib/camera/tflite/modelTypes';

export const MVP_INPUT_224 = 224;

export const MVP_IMAGENET_NORM: ImageNormalization = {
  mean: [...MOBILENET_PREVIEW_IMAGENET_MEAN] as [number, number, number],
  std: [...MOBILENET_PREVIEW_IMAGENET_STD] as [number, number, number],
};
