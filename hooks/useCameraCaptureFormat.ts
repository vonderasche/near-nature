import { useMemo } from 'react';
import type { CameraDevice, CameraDeviceFormat } from 'react-native-vision-camera';
import { useCameraFormat } from 'react-native-vision-camera';

type Options = {
  hdrEnabled: boolean;
  stabilizationEnabled: boolean;
  /** When true, pick a format compatible with photo + YUV video (frame processor). */
  livePreviewEnabled?: boolean;
};

function isVideoCapableFormat(format: CameraDeviceFormat | undefined): boolean {
  return Boolean(format && format.videoWidth > 0 && format.videoHeight > 0);
}

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
  /** True when the selected format can bind photo + YUV video for frame processors. */
  livePreviewVideoReady: boolean;
} {
  const maxPhotoFormat = useCameraFormat(device, [{ photoResolution: 'max' }]);
  const livePreviewBaseFormat = useCameraFormat(device, [
    { videoResolution: { width: 1280, height: 720 } },
    { photoResolution: 'max' },
    { fps: 30 },
  ]);

  const formatFilters = useMemo(() => {
    if (livePreviewEnabled) {
      return [
        { videoResolution: { width: 1280, height: 720 } },
        { photoResolution: 'max' },
        { fps: 30 },
      ];
    }

    const filters: Record<string, unknown>[] = [];
    if (hdrEnabled) filters.push({ photoHdr: true });
    if (stabilizationEnabled) filters.push({ videoStabilizationMode: 'auto' });
    filters.push({ photoResolution: 'max' });
    return filters;
  }, [hdrEnabled, livePreviewEnabled, stabilizationEnabled]);

  const preferredFormat = useCameraFormat(device, formatFilters);

  const format = livePreviewEnabled
    ? (preferredFormat ?? livePreviewBaseFormat)
    : (preferredFormat ?? maxPhotoFormat);

  const hdrSupported = Boolean(maxPhotoFormat?.supportsPhotoHdr);
  const stabilizationSupported = Boolean(
    maxPhotoFormat?.videoStabilizationModes?.some((mode) => mode !== 'off'),
  );

  const livePreviewVideoReady = !livePreviewEnabled || isVideoCapableFormat(format);
  const photoHdr =
    !livePreviewEnabled && hdrEnabled && hdrSupported && Boolean(format?.supportsPhotoHdr);
  const effectiveStabilizationEnabled = !livePreviewEnabled && stabilizationEnabled;

  return useMemo(
    () => ({
      format,
      photoHdr,
      hdrSupported,
      stabilizationSupported,
      stabilizationEnabled: effectiveStabilizationEnabled,
      livePreviewVideoReady,
    }),
    [
      effectiveStabilizationEnabled,
      format,
      hdrSupported,
      livePreviewVideoReady,
      photoHdr,
      stabilizationSupported,
    ],
  );
}
