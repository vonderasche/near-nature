import type { ComponentProps } from 'react';

import { CameraLivePredictionsOverlay } from '@/components/camera/camera-live-predictions-overlay';
import { CameraLivePreview } from '@/components/camera/camera-live-preview';
import { useMobileNetTop16FrameProcessor } from '@/hooks/useMobileNetTop16FrameProcessor';
import { areFrameProcessorsAvailable } from '@/lib/camera/areFrameProcessorsAvailable';

type Props = ComponentProps<typeof CameraLivePreview> & {
  liveClassifierEnabled: boolean;
};

const REBUILD_HINT =
  'Frame processors are disabled in this build. Run npx expo prebuild, then rebuild the native app.';

export function CameraLivePreviewWithMobileNet({
  liveClassifierEnabled,
  ...previewProps
}: Props) {
  if (!liveClassifierEnabled) {
    return <CameraLivePreview {...previewProps} />;
  }

  if (!areFrameProcessorsAvailable()) {
    return (
      <>
        <CameraLivePreview {...previewProps} />
        <CameraLivePredictionsOverlay
          enabled
          modelState="unavailable"
          modelError={REBUILD_HINT}
          predictions={[]}
        />
      </>
    );
  }

  return (
    <CameraLivePreviewWithMobileNetActive
      {...previewProps}
      liveClassifierEnabled={liveClassifierEnabled}
    />
  );
}

function CameraLivePreviewWithMobileNetActive({
  liveClassifierEnabled,
  ...previewProps
}: Props) {
  const { frameProcessor, modelState, modelError, predictions } =
    useMobileNetTop16FrameProcessor(previewProps.isActive && liveClassifierEnabled);

  return (
    <>
      <CameraLivePreview {...previewProps} frameProcessor={frameProcessor} />
      <CameraLivePredictionsOverlay
        enabled={liveClassifierEnabled}
        modelState={modelState}
        modelError={modelError}
        predictions={predictions}
      />
    </>
  );
}
