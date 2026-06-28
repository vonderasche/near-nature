import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { CameraLivePredictionsOverlay } from '@/components/camera/camera-live-predictions-overlay';
import { CameraLivePreview } from '@/components/camera/camera-live-preview';
import { useLivePreviewFrameProcessor } from '@/hooks/useLivePreviewFrameProcessor';
import { areFrameProcessorsAvailable } from '@/lib/camera/areFrameProcessorsAvailable';
import type { PreviewModelId } from '@/lib/camera/tflite/preview';

type Props = ComponentProps<typeof CameraLivePreview> & {
  liveClassifierEnabled: boolean;
  previewMode?: PreviewModelId;
  bottomInset: number;
};

const LIVE_PREVIEW_UNAVAILABLE_HINT =
  'Live preview AI is not available in this build. Photo identification still works.';

export function CameraLivePreviewWithClassifier({
  liveClassifierEnabled,
  previewMode = 'scene_gate',
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
      previewMode={previewMode}
      bottomInset={bottomInset}
    />
  );
}

function CameraLivePreviewWithClassifierActive({
  liveClassifierEnabled,
  previewMode = 'scene_gate',
  bottomInset,
  ...previewProps
}: Props) {
  const frameProcessingActive =
    previewProps.isActive && !previewProps.isResumingPreview && liveClassifierEnabled;

  const { frameProcessor, modelState, modelError, predictions } = useLivePreviewFrameProcessor(
    frameProcessingActive,
    previewMode,
  );

  return (
    <View style={styles.previewRoot} pointerEvents="box-none">
      <CameraLivePreview
        {...previewProps}
        videoPipelineEnabled
        frameProcessor={frameProcessor}
      />
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
