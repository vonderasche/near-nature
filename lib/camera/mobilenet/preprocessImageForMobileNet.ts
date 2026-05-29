import { decode } from 'base64-arraybuffer';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import jpeg from 'jpeg-js';

import { MOBILENET_PREVIEW_INPUT_SIZE } from '@/lib/camera/mobilenet/modelConfig';
import { normalizeMobileNetInput } from '@/lib/camera/mobilenet/normalizeMobileNetInput';

/** Resizes a photo to 224×224 RGB and applies ImageNet normalization for MobileNet TFLite models. */
export async function preprocessImageForMobileNet(photoUri: string): Promise<Float32Array> {
  const resized = await manipulateAsync(
    photoUri,
    [{ resize: { width: MOBILENET_PREVIEW_INPUT_SIZE, height: MOBILENET_PREVIEW_INPUT_SIZE } }],
    { compress: 1, format: SaveFormat.JPEG, base64: true },
  );

  const base64 = resized.base64;
  if (!base64) {
    throw new Error('Could not prepare the photo for on-device identification.');
  }

  const decoded = jpeg.decode(new Uint8Array(decode(base64)), { useTArray: true });
  const { width, height, data } = decoded;
  if (width !== MOBILENET_PREVIEW_INPUT_SIZE || height !== MOBILENET_PREVIEW_INPUT_SIZE) {
    throw new Error('Image resize did not produce the expected dimensions for the model.');
  }

  const rgb = new Float32Array(width * height * 3);
  for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
    rgb[j] = data[i] ?? 0;
    rgb[j + 1] = data[i + 1] ?? 0;
    rgb[j + 2] = data[i + 2] ?? 0;
  }

  return normalizeMobileNetInput(rgb);
}
