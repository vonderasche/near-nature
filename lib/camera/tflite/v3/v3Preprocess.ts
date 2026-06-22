import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'jpeg-js';

import { ensureLocalImageUri } from '@/lib/camera/tflite/ensureLocalImageUri';
import {
  MVP_IMAGENET_NORM,
  MVP_INPUT_224,
} from '@/lib/camera/tflite/mvp/mvpCaptureConfig';
import { rgbaToNormalizedFloat32Nhwc } from '@/lib/camera/tflite/v3/v3ImageTransforms';

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function loadRgbaFromResizedUri(
  imageUri: string,
  width: number,
  height: number,
): Promise<{ data: Uint8Array; width: number; height: number }> {
  const resized = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width, height } }],
    { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true },
  );

  if (!resized.base64) {
    throw new Error('Could not read resized image data.');
  }

  const decoded = decode(base64ToUint8Array(resized.base64), { useTArray: true });
  return {
    data: decoded.data,
    width: decoded.width,
    height: decoded.height,
  };
}

/** 224×224 square-stretch RGB, ImageNet-normalized NHWC float32. */
export async function buildV3Input224Square(imageUri: string): Promise<ArrayBuffer> {
  const localUri = await ensureLocalImageUri(imageUri);
  const { data, width, height } = await loadRgbaFromResizedUri(
    localUri,
    MVP_INPUT_224,
    MVP_INPUT_224,
  );
  return rgbaToNormalizedFloat32Nhwc(data, width, height, MVP_IMAGENET_NORM);
}
