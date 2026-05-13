import type { CameraPictureOptions, CameraView } from 'expo-camera';
import type { RefObject } from 'react';

const DEFAULT_OPTIONS: CameraPictureOptions = { quality: 0.9, shutterSound: false };

/**
 * Takes a picture using a mounted {@link CameraView} ref. Returns `null` if the ref is empty.
 */
export async function capturePictureFromCameraRef(
  cameraRef: RefObject<CameraView | null>,
  options?: CameraPictureOptions
) {
  const cam = cameraRef.current;
  if (!cam) return null;
  return cam.takePictureAsync({ ...DEFAULT_OPTIONS, ...options });
}
