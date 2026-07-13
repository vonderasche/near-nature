import type { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';

export function modelSupportsFrameSkipping(config: ClassificationModelConfig): boolean {
  return config.supportsFrameSkipping === true;
}
