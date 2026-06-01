import type { ComponentProps } from 'react';

import { CameraLivePredictionsOverlay } from '@/components/camera/camera-live-predictions-overlay';
import { CameraLivePreview } from '@/components/camera/camera-live-preview';
import { useLivePreviewFrameProcessor } from '@/hooks/useLivePreviewFrameProcessor';
import { areFrameProcessorsAvailable } from '@/lib/camera/areFrameProcessorsAvailable';

type Props = ComponentProps<typeof CameraLivePreview> & {
  liveClassifierEnabled: boolean;
};

const REBUILD_HINT =
  'Frame processors are disabled in this build. Run npx expo prebuild, then rebuild the native app.';

export function CameraLivePreviewWithClassifier({
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
    <CameraLivePreviewWithClassifierActive
      {...previewProps}
      liveClassifierEnabled={liveClassifierEnabled}
    />
  );
}

function CameraLivePreviewWithClassifierActive({
  liveClassifierEnabled,
  ...previewProps
}: Props) {
  // Guard against VisionCameraProxy "view not found" crashes during preview remount/resume.
  const frameProcessingActive =
    previewProps.isActive && !previewProps.isResumingPreview && liveClassifierEnabled;

  const { frameProcessor, modelState, modelError, predictions } =
    useLivePreviewFrameProcessor(frameProcessingActive);

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
