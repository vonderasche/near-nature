import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

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
      <View style={styles.previewRoot} pointerEvents="box-none">
        <CameraLivePreview {...previewProps} />
        <CameraLivePredictionsOverlay
          enabled
          bottomInset={bottomInset}
          modelState="unavailable"
          modelError={LIVE_PREVIEW_UNAVAILABLE_HINT}
          predictions={[]}
        />
      </View>
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
    <View style={styles.previewRoot} pointerEvents="box-none">
      <CameraLivePreview {...previewProps} frameProcessor={frameProcessor} />
      <CameraLivePredictionsOverlay
        enabled={liveClassifierEnabled}
        bottomInset={bottomInset}
        modelState={modelState}
        modelError={modelError}
        predictions={predictions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  previewRoot: {
    ...StyleSheet.absoluteFillObject,
  },
});
