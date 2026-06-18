import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'jpeg-js';
import { Image } from 'react-native';

import { ensureLocalImageUri } from '@/lib/camera/tflite/ensureLocalImageUri';
import {
  V3_B1_RESIZE_SHORT_EDGE,
  V3_IMAGENET_NORM,
  V3_INPUT_224,
  V3_INPUT_240,
} from '@/lib/camera/tflite/v3/v3CascadeConfig';
import {
  centerCropRgba,
  resizeShortEdgeDimensions,
  rgbaToNormalizedFloat32Nhwc,
} from '@/lib/camera/tflite/v3/v3ImageTransforms';

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error),
    );
  });
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
    V3_INPUT_224,
    V3_INPUT_224,
  );
  return rgbaToNormalizedFloat32Nhwc(data, width, height, V3_IMAGENET_NORM);
}

/** Resize short edge 255, center crop 240×240, ImageNet-normalized NHWC float32. */
export async function buildV3Input240B1Crop(imageUri: string): Promise<ArrayBuffer> {
  const localUri = await ensureLocalImageUri(imageUri);
  const { width, height } = await getImageSize(localUri);
  const resizedDims = resizeShortEdgeDimensions(width, height, V3_B1_RESIZE_SHORT_EDGE);
  const { data, width: resizedWidth, height: resizedHeight } = await loadRgbaFromResizedUri(
    localUri,
    resizedDims.width,
    resizedDims.height,
  );
  const cropped = centerCropRgba(data, resizedWidth, resizedHeight, V3_INPUT_240);
  return rgbaToNormalizedFloat32Nhwc(cropped, V3_INPUT_240, V3_INPUT_240, V3_IMAGENET_NORM);
}
