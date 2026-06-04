import type { ComponentProps } from 'react';

import { CameraLivePredictionsOverlay } from '@/components/camera/camera-live-predictions-overlay';
import { CameraLivePreview } from '@/components/camera/camera-live-preview';
import { useLivePreviewFrameProcessor } from '@/hooks/useLivePreviewFrameProcessor';
import { areFrameProcessorsAvailable } from '@/lib/camera/areFrameProcessorsAvailable';

type Props = ComponentProps<typeof CameraLivePreview> & {
  liveClassifierEnabled: boolean;
  bottomInset: number;
};

const LIVE_PREVIEW_UNAVAILABLE_HINT =
  'Live preview AI is not available in this build. Photo identification still works.';

export function CameraLivePreviewWithClassifier({
  liveClassifierEnabled,
  bottomInset,
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
          bottomInset={bottomInset}
          modelState="unavailable"
          modelError={LIVE_PREVIEW_UNAVAILABLE_HINT}
          predictions={[]}
        />
      </>
    );
  }

  return (
    <CameraLivePreviewWithClassifierActive
      {...previewProps}
      liveClassifierEnabled={liveClassifierEnabled}
      bottomInset={bottomInset}
    />
  );
}

function CameraLivePreviewWithClassifierActive({
  liveClassifierEnabled,
  bottomInset,
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
        bottomInset={bottomInset}
        modelState={modelState}
        modelError={modelError}
        predictions={predictions}
      />
    </>
  );
}
