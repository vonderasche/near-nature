import type { ComponentProps } from 'react';

import { CameraLivePreview } from '@/components/camera/camera-live-preview';
import { MobileNetDebugOverlay } from '@/components/camera/mobilenet-debug-overlay';
import { useMobileNetFrameProcessor } from '@/hooks/useMobileNetFrameProcessor';

type Props = ComponentProps<typeof CameraLivePreview>;

/** Camera preview with optional MobileNet frame processor overlay (dev flag). */
export function CameraLivePreviewWithMobileNet(props: Props) {
  const { frameProcessor, modelState, modelError, debug } = useMobileNetFrameProcessor(
    props.isActive,
  );

  return (
    <>
      <CameraLivePreview {...props} frameProcessor={frameProcessor} />
      <MobileNetDebugOverlay modelState={modelState} modelError={modelError} debug={debug} />
    </>
  );
}
