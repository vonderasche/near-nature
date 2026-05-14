import type { CameraCapturedPicture, CameraPictureOptions, CameraView } from 'expo-camera';
import type { RefObject } from 'react';

import { deleteAsync } from '@/lib/fs/legacyFileSystem';
import { cropImageToSquareCenter } from '@/lib/image/cropImageToSquareCenter';

const DEFAULT_OPTIONS: CameraPictureOptions = { quality: 0.9, shutterSound: false };

/**
 * Takes a picture using a mounted {@link CameraView} ref. Returns `null` if the ref is empty.
 * Output is always square: center-crops when the device returns a non-square frame.
 */
export async function capturePictureFromCameraRef(
  cameraRef: RefObject<CameraView | null>,
  options?: CameraPictureOptions
): Promise<CameraCapturedPicture | null> {
  const cam = cameraRef.current;
  if (!cam) return null;

  const photo = await cam.takePictureAsync({ ...DEFAULT_OPTIONS, ...options });
  if (!photo?.uri) return null;

  const { uri, width, height } = photo;
  if (!width || !height || width === height) {
    return photo;
  }

  try {
    const cropped = await cropImageToSquareCenter(uri, width, height, options?.quality ?? 0.9);
    if (cropped.uri !== uri) {
      await deleteAsync(uri, { idempotent: true }).catch(() => {});
    }
    return {
      ...photo,
      uri: cropped.uri,
      width: cropped.width,
      height: cropped.height,
    };
  } catch {
    return photo;
  }
}
