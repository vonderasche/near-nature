import {
  MOBILENET_TOP16_IMAGENET_MEAN,
  MOBILENET_TOP16_IMAGENET_STD,
} from '@/lib/camera/mobilenet/modelConfig';

export function normalizeMobileNetInput(input: Float32Array): Float32Array {
  'worklet';
  const normalized = new Float32Array(input.length);
  for (let i = 0; i < input.length; i += 3) {
    normalized[i] =
      ((input[i] ?? 0) - MOBILENET_TOP16_IMAGENET_MEAN[0]) / MOBILENET_TOP16_IMAGENET_STD[0];
    normalized[i + 1] =
      ((input[i + 1] ?? 0) - MOBILENET_TOP16_IMAGENET_MEAN[1]) / MOBILENET_TOP16_IMAGENET_STD[1];
    normalized[i + 2] =
      ((input[i + 2] ?? 0) - MOBILENET_TOP16_IMAGENET_MEAN[2]) / MOBILENET_TOP16_IMAGENET_STD[2];
  }
  return normalized;
}
