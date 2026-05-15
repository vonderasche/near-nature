import { useMemo } from 'react';
import type { CameraDevice, CameraDeviceFormat } from 'react-native-vision-camera';
import { useCameraFormat } from 'react-native-vision-camera';

const FORMAT_FILTERS = [{ photoHdr: true }, { photoResolution: 'max' as const }] as const;

/**
 * Picks a photo format favoring HDR (when supported) and max resolution for vision capture.
 */
export function useCameraCaptureFormat(device: CameraDevice | undefined): {
  format: CameraDeviceFormat | undefined;
  photoHdr: boolean;
} {
  const format = useCameraFormat(device, [...FORMAT_FILTERS]);
  const photoHdr = Boolean(format?.supportsPhotoHdr);

  return useMemo(
    () => ({
      format,
      photoHdr,
    }),
    [format, photoHdr],
  );
}
