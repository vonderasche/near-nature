import { VisionCameraProxy } from 'react-native-vision-camera';

/** True when the native dev client was built with frame processors + worklets. */
export function areFrameProcessorsAvailable(): boolean {
  return VisionCameraProxy.workletContext != null;
}
