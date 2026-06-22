import { useMemo } from 'react';
import type { CameraDevice, CameraDeviceFormat } from 'react-native-vision-camera';
import { useCameraFormat } from 'react-native-vision-camera';

type Options = {
  hdrEnabled: boolean;
  stabilizationEnabled: boolean;
  /** When true, pick a format compatible with photo + YUV video (frame processor). */
  livePreviewEnabled?: boolean;
};

/**
 * Picks a capture format with optional HDR and stabilization filters.
 * Live preview uses a video-capable format and skips HDR/stabilization (they conflict with YUV video on many devices).
 */
export function useCameraCaptureFormat(
  device: CameraDevice | undefined,
  { hdrEnabled, stabilizationEnabled, livePreviewEnabled = false }: Options,
): {
  format: CameraDeviceFormat | undefined;
  photoHdr: boolean;
  hdrSupported: boolean;
  stabilizationSupported: boolean;
  stabilizationEnabled: boolean;
} {
  const baselineFormat = useCameraFormat(device, [{ photoResolution: 'max' }]);

  const formatFilters = useMemo(() => {
    if (livePreviewEnabled) {
      return [
        { videoResolution: { width: 1280, height: 720 } },
        { photoResolution: 'max' },
      ];
    }

    const filters: Record<string, unknown>[] = [];
    if (hdrEnabled) filters.push({ photoHdr: true });
    if (stabilizationEnabled) filters.push({ videoStabilizationMode: 'auto' });
    filters.push({ photoResolution: 'max' });
    return filters;
  }, [hdrEnabled, livePreviewEnabled, stabilizationEnabled]);

  const format = useCameraFormat(device, formatFilters);

  const hdrSupported = Boolean(baselineFormat?.supportsPhotoHdr);
  const stabilizationSupported = Boolean(
    baselineFormat?.videoStabilizationModes?.some((mode) => mode !== 'off'),
  );

  const photoHdr =
    !livePreviewEnabled && hdrEnabled && hdrSupported && Boolean(format?.supportsPhotoHdr);
  const effectiveStabilizationEnabled = !livePreviewEnabled && stabilizationEnabled;

  return useMemo(
    () => ({
      format: format ?? baselineFormat,
      photoHdr,
      hdrSupported,
      stabilizationSupported,
      stabilizationEnabled: effectiveStabilizationEnabled,
    }),
    [
      baselineFormat,
      effectiveStabilizationEnabled,
      format,
      hdrSupported,
      photoHdr,
      stabilizationSupported,
    ],
  );
}
