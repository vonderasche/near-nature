import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { CameraLivePredictionsOverlay } from '@/components/camera/camera-live-predictions-overlay';
import { CameraLivePreview } from '@/components/camera/camera-live-preview';
import { useLivePreviewFrameProcessor } from '@/hooks/useLivePreviewFrameProcessor';
import { areFrameProcessorsAvailable } from '@/lib/camera/areFrameProcessorsAvailable';
import type { PreviewModelId } from '@/lib/camera/tflite/preview';
import type { CameraDeviceFormat } from 'react-native-vision-camera';

type Props = ComponentProps<typeof CameraLivePreview> & {
  liveClassifierEnabled: boolean;
  previewMode?: PreviewModelId;
  bottomInset: number;
  livePreviewVideoReady?: boolean;
};

function isVideoCapableFormat(format: CameraDeviceFormat | undefined): boolean {
  return Boolean(format && format.videoWidth > 0 && format.videoHeight > 0);
}

const LIVE_PREVIEW_UNAVAILABLE_HINT =
  'Live preview AI is not available in this build. Photo identification still works.';

export function CameraLivePreviewWithClassifier({
  liveClassifierEnabled,
  previewMode = 'v14',
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
  previewMode = 'v14',
  bottomInset,
  ...previewProps
}: Props) {
  const frameProcessingActive =
    previewProps.isActive && !previewProps.isResumingPreview && liveClassifierEnabled;
  const livePreviewVideoReady =
    previewProps.livePreviewVideoReady ?? isVideoCapableFormat(previewProps.format);

  const { frameProcessor, modelState, modelError, predictions, inferenceTimestamp } =
    useLivePreviewFrameProcessor(frameProcessingActive && livePreviewVideoReady, previewMode);

  return (
    <View style={styles.previewRoot} pointerEvents="box-none">
      <CameraLivePreview
        {...previewProps}
        videoPipelineEnabled={livePreviewVideoReady}
        frameProcessor={livePreviewVideoReady ? frameProcessor : undefined}
      />
      <CameraLivePredictionsOverlay
        enabled={liveClassifierEnabled}
        bottomInset={bottomInset}
        modelState={modelState}
        modelError={modelError}
        predictions={predictions}
        revisionKey={inferenceTimestamp}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  previewRoot: {
    ...StyleSheet.absoluteFillObject,
  },
});
