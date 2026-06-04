import { useMemo } from 'react';

import { useMlFrameProcessor } from '@/hooks/useMlFrameProcessor';
import type { LiveClassifierModelState, LiveClassifierPrediction } from '@/lib/camera/liveClassifierTypes';
import { formatMobileNetError } from '@/lib/camera/mobilenet/formatMobileNetError';
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
): UseLivePreviewFrameProcessorResult {
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

  const resolvedError =
    modelError != null ? formatMobileNetError(modelError) : null;

  return {
    frameProcessor:
      active && modelState === 'loaded' && modelError == null ? frameProcessor : undefined,
    modelState: resolvedModelState,
    modelError: resolvedError,
    predictions,
  };
}
