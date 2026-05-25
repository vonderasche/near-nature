import { VisionCameraProxy } from 'react-native-vision-camera';

/** True when the native build includes VisionCamera frame processors and Worklets. */
export function areFrameProcessorsAvailable(): boolean {
  return VisionCameraProxy.workletContext != null;
}
