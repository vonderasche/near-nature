import type { ComponentProps } from 'react';

import { CameraLivePreview } from '@/components/camera/camera-live-preview';
import { MobileNetDebugOverlay } from '@/components/camera/mobilenet-debug-overlay';
import { useMobileNetFrameProcessor } from '@/hooks/useMobileNetFrameProcessor';
import { areFrameProcessorsAvailable } from '@/lib/camera/areFrameProcessorsAvailable';

type Props = ComponentProps<typeof CameraLivePreview>;

const REBUILD_HINT =
  'Frame processors are disabled in this build. Run: npx expo prebuild, then npm run android (or ios).';

/** Camera preview with optional MobileNet frame processor overlay (dev flag). */
export function CameraLivePreviewWithMobileNet(props: Props) {
  if (!areFrameProcessorsAvailable()) {
    return (
      <>
        <CameraLivePreview {...props} />
        <MobileNetDebugOverlay
          modelState="unavailable"
          modelError={REBUILD_HINT}
          debug={null}
        />
      </>
    );
  }

  return <CameraLivePreviewWithMobileNetActive {...props} />;
}

function CameraLivePreviewWithMobileNetActive(props: Props) {
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
