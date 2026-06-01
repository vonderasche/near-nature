import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import jpeg from 'jpeg-js';

import { SPECIALIST_MODEL_INPUT_SIZE } from '@/lib/camera/mobilenet/modelConfig';
import {
  MOBILENET_PREVIEW_IMAGENET_MEAN,
  MOBILENET_PREVIEW_IMAGENET_STD,
} from '@/lib/camera/mobilenet/modelConfig';

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Resizes a photo to square RGB and applies ImageNet normalization for TFLite models. */
export async function preprocessImageForMobileNet(
  photoUri: string,
  size: number = SPECIALIST_MODEL_INPUT_SIZE,
): Promise<Float32Array> {
  const resized = await manipulateAsync(
    photoUri,
    [{ resize: { width: size, height: size } }],
    { compress: 1, format: SaveFormat.JPEG, base64: true },
  );

  const base64 = resized.base64;
  if (!base64) {
    throw new Error('Could not prepare the photo for on-device identification.');
  }

  const decoded = jpeg.decode(base64ToUint8Array(base64), { useTArray: true });
  const { width, height, data } = decoded;
  if (width !== size || height !== size) {
    throw new Error('Image resize did not produce the expected dimensions for the model.');
  }

  const pixelCount = width * height;
  const out = new Float32Array(pixelCount * 3);

  for (let i = 0; i < pixelCount; i += 1) {
    const rgbaOffset = i * 4;
    const rgbOffset = i * 3;
    const r = (data[rgbaOffset] ?? 0) / 255;
    const g = (data[rgbaOffset + 1] ?? 0) / 255;
    const b = (data[rgbaOffset + 2] ?? 0) / 255;

    out[rgbOffset] = (r - MOBILENET_PREVIEW_IMAGENET_MEAN[0]) / MOBILENET_PREVIEW_IMAGENET_STD[0];
    out[rgbOffset + 1] =
      (g - MOBILENET_PREVIEW_IMAGENET_MEAN[1]) / MOBILENET_PREVIEW_IMAGENET_STD[1];
    out[rgbOffset + 2] =
      (b - MOBILENET_PREVIEW_IMAGENET_MEAN[2]) / MOBILENET_PREVIEW_IMAGENET_STD[2];
  }

  return out;
}
