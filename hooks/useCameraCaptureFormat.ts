import { useMemo } from 'react';
import type { CameraDevice, CameraDeviceFormat } from 'react-native-vision-camera';
import { useCameraFormat } from 'react-native-vision-camera';

type Options = {
  hdrEnabled: boolean;
  stabilizationEnabled: boolean;
};

/**
 * Picks a photo format (max resolution) with optional HDR and stabilization filters.
 */
export function useCameraCaptureFormat(
  device: CameraDevice | undefined,
  { hdrEnabled, stabilizationEnabled }: Options,
): {
  format: CameraDeviceFormat | undefined;
  photoHdr: boolean;
  hdrSupported: boolean;
  stabilizationSupported: boolean;
} {
  const baselineFormat = useCameraFormat(device, [{ photoResolution: 'max' }]);

  const formatFilters = useMemo(() => {
    const filters: Record<string, unknown>[] = [];
    if (hdrEnabled) filters.push({ photoHdr: true });
    if (stabilizationEnabled) filters.push({ videoStabilizationMode: 'auto' });
    filters.push({ photoResolution: 'max' });
    return filters;
  }, [hdrEnabled, stabilizationEnabled]);

  const format = useCameraFormat(device, formatFilters);

  const hdrSupported = Boolean(baselineFormat?.supportsPhotoHdr);
  const stabilizationSupported = Boolean(
    baselineFormat?.videoStabilizationModes?.some((mode) => mode !== 'off'),
  );

  const photoHdr = hdrEnabled && hdrSupported && Boolean(format?.supportsPhotoHdr);

  return useMemo(
    () => ({
      format: format ?? baselineFormat,
      photoHdr,
      hdrSupported,
      stabilizationSupported,
    }),
    [baselineFormat, format, hdrSupported, photoHdr, stabilizationSupported],
  );
}
