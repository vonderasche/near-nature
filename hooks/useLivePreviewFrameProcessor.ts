import { useEffect, useRef } from 'react';

import { useMlFrameProcessor } from '@/hooks/useMlFrameProcessor';
import { useMvpLivePreviewSuspended } from '@/hooks/useMvpLivePreviewSuspended';
import { getGlobalClassificationDebugSession } from '@/lib/classification/debug';
import { shouldSampleEvent } from '@/lib/classification/debug/sampling';
import type { LiveClassifierModelState, LiveClassifierPrediction } from '@/lib/camera/liveClassifierTypes';
import { formatMobileNetError } from '@/lib/camera/mobilenet/formatMobileNetError';
import type { KingdomPreviewDisplayState } from '@/lib/camera/tflite/preview/kingdomPreviewFeedback';
import { isMvpCaptureSessionActive } from '@/lib/camera/tflite/mvp/mvpTfliteMemory';
import {
  getPreviewModelConfig,
  mapPreviewPredictions,
  type PreviewModelId,
  releasePreviewModels,
  setActivePreviewModel,
} from '@/lib/camera/tflite/preview';

type UseLivePreviewFrameProcessorResult = {
  frameProcessor: ReturnType<typeof useMlFrameProcessor>['frameProcessor'] | undefined;
  modelState: Exclude<LiveClassifierModelState, 'unavailable'>;
  modelError: string | null;
  predictions: LivePreviewPrediction[];
  organismDetected: boolean;
  inferenceTimestamp: number;
};

export type LivePreviewPrediction = LiveClassifierPrediction;

export function useLivePreviewFrameProcessor(
  active: boolean,
  previewModelId: PreviewModelId = 'kingdom',
): UseLivePreviewFrameProcessorResult {
  const livePreviewSuspended = useMvpLivePreviewSuspended();
  const previewActive = active && !livePreviewSuspended && !isMvpCaptureSessionActive();
  const config = getPreviewModelConfig(previewModelId);
  const kingdomPreviewStateRef = useRef<KingdomPreviewDisplayState>('searching');
  const dominantOrganismRef = useRef<string | null>(null);
  const lastPreviewTelemetryLabelRef = useRef<string | null>(null);
  const lastPreviewTelemetryDetailRef = useRef<string | null>(null);

  useEffect(() => {
    if (previewActive) {
      setActivePreviewModel(previewModelId);
      return;
    }
    releasePreviewModels();
  }, [previewActive, previewModelId]);

  useEffect(() => {
    kingdomPreviewStateRef.current = 'searching';
    dominantOrganismRef.current = null;
    lastPreviewTelemetryLabelRef.current = null;
    lastPreviewTelemetryDetailRef.current = null;
  }, [previewActive, previewModelId]);

  const { frameProcessor, result, modelState, modelError } = useMlFrameProcessor({
    config,
    enabled: previewActive,
    frameSkippingEnabled: true,
  });

  const inferenceTimestamp = result?.timestamp ?? 0;
  const mapped =
    result?.type === 'classification'
      ? mapPreviewPredictions(
          previewModelId,
          result.predictions,
          kingdomPreviewStateRef,
          dominantOrganismRef,
        )
      : { predictions: [], organismDetected: false };
  const { predictions, organismDetected } = mapped;

  useEffect(() => {
    if (!previewActive || predictions.length === 0) return;

    const topLabel = predictions[0]?.label ?? '';
    const topDetail = predictions[0]?.detail ?? '';
    const labelChanged =
      topLabel !== lastPreviewTelemetryLabelRef.current ||
      topDetail !== lastPreviewTelemetryDetailRef.current;
    if (labelChanged) {
      lastPreviewTelemetryLabelRef.current = topLabel;
      lastPreviewTelemetryDetailRef.current = topDetail;
    }

    const forceSample = labelChanged;
    if (!forceSample && !shouldSampleEvent('live_preview_sample')) return;

    getGlobalClassificationDebugSession()?.emit(
      'live_preview_sample',
      {
        modelId: previewModelId,
        predictions: predictions.map((row) => ({
          label: row.label,
          confidence: row.confidence,
          classIndex: row.classIndex,
        })),
      },
      { forceSample },
    );
  }, [predictions, previewActive, previewModelId]);

  const resolvedModelState: Exclude<LiveClassifierModelState, 'unavailable'> =
    modelState === 'loaded' ? 'loaded' : modelState === 'loading' ? 'loading' : 'error';

  return {
    frameProcessor:
      previewActive && modelState === 'loaded' && modelError == null ? frameProcessor : undefined,
    modelState: resolvedModelState,
    modelError: modelError != null ? formatMobileNetError(modelError) : null,
    predictions,
    organismDetected,
    inferenceTimestamp,
  };
}
