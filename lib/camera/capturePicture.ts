import type { Camera, PhotoFile, TakePhotoOptions } from 'react-native-vision-camera';
import type { RefObject } from 'react';

import { deleteAsync } from '@/lib/fs/legacyFileSystem';
import { cropImageToSquareCenter } from '@/lib/image/cropImageToSquareCenter';
import { photoFileToUri } from '@/lib/camera/photoFileUri';

const DEFAULT_OPTIONS: TakePhotoOptions = {};

/**
 * Takes a photo using a mounted VisionCamera {@link Camera} ref.
 * Output is always square: center-crops when the device returns a non-square frame.
 *
 * Returns a `file://` URI ready for `<Image />`, file reads, and uploads.
 */
export type CapturePhotoOptions = TakePhotoOptions & {
  enableShutterSound?: boolean;
};

export async function captureSquarePhotoFromCameraRef(
  cameraRef: RefObject<Camera | null>,
  options?: CapturePhotoOptions,
): Promise<{ uri: string; width: number; height: number } | null> {
  const cam = cameraRef.current;
  if (!cam) return null;

  const { enableShutterSound = false, ...takeOptions } = options ?? {};
  const photo: PhotoFile = await cam.takePhoto({
    ...DEFAULT_OPTIONS,
    ...takeOptions,
    enableShutterSound,
  });
  const uri = photoFileToUri(photo.path);
  const width = photo.width;
  const height = photo.height;

  if (!width || !height || width === height) {
    return { uri, width, height };
  }

  try {
    const cropped = await cropImageToSquareCenter(uri, width, height, 0.9);
    if (cropped.uri !== uri) {
      await deleteAsync(uri, { idempotent: true }).catch(() => {});
    }
    return { uri: cropped.uri, width: cropped.width, height: cropped.height };
  } catch {
    return { uri, width, height };
  }
}

