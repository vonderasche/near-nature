import { useMemo } from 'react';

import { useMlFrameProcessor } from '@/hooks/useMlFrameProcessor';
import { useMvpLivePreviewSuspended } from '@/hooks/useMvpLivePreviewSuspended';
import { useMvpPreviewFrameProcessor } from '@/hooks/useMvpPreviewFrameProcessor';
import type { LiveClassifierModelState, LiveClassifierPrediction } from '@/lib/camera/liveClassifierTypes';
import { formatMobileNetError } from '@/lib/camera/mobilenet/formatMobileNetError';
import { isMvpCaptureEnabled } from '@/lib/camera/tflite/mvp/isMvpCaptureEnabled';
import { isMvpCaptureSessionActive } from '@/lib/camera/tflite/mvp/mvpTfliteMemory';
import type { MvpPreviewMode } from '@/lib/camera/tflite/mvp/mvpPreviewMode';
import { efficientnetB0LivePreviewConfig } from '@/lib/camera/tflite/modelConfigs';

type UseLivePreviewFrameProcessorResult = {
  frameProcessor: ReturnType<typeof useMlFrameProcessor>['frameProcessor'] | undefined;
  modelState: Exclude<LiveClassifierModelState, 'unavailable'>;
  modelError: string | null;
  predictions: LivePreviewPrediction[];
};

export type LivePreviewPrediction = LiveClassifierPrediction;

export function useLivePreviewFrameProcessor(
  active: boolean,
  previewMode: MvpPreviewMode = 'scene_gate',
): UseLivePreviewFrameProcessorResult {
  const livePreviewSuspended = useMvpLivePreviewSuspended();
  const useMvp = isMvpCaptureEnabled();
  const previewActive =
    active && !livePreviewSuspended && !(useMvp && isMvpCaptureSessionActive());
  const mvp = useMvpPreviewFrameProcessor(previewActive && useMvp, previewMode);
  const legacy = useLegacyEfficientNetPreview(previewActive && !useMvp);
  return useMvp ? mvp : legacy;
}

function useLegacyEfficientNetPreview(active: boolean): UseLivePreviewFrameProcessorResult {
  const { frameProcessor, result, modelState, modelError } = useMlFrameProcessor({
    config: efficientnetB0LivePreviewConfig,
    enabled: active,
  });

  const predictions = useMemo((): LivePreviewPrediction[] => {
    if (result?.type !== 'classification') return [];

    return result.predictions.map((row, classIndex) => ({
      classIndex,
      confidence: row.confidence,
      label: row.label,
    }));
  }, [result]);

  const resolvedModelState: Exclude<LiveClassifierModelState, 'unavailable'> =
    modelState === 'loaded' ? 'loaded' : modelState === 'loading' ? 'loading' : 'error';

  return {
    frameProcessor:
      active && modelState === 'loaded' && modelError == null ? frameProcessor : undefined,
    modelState: resolvedModelState,
    modelError: modelError != null ? formatMobileNetError(modelError) : null,
    predictions,
  };
}
