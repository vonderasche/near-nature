import { useMemo } from 'react';

import { useMlFrameProcessor } from '@/hooks/useMlFrameProcessor';
import { useV3PreviewFrameProcessor } from '@/hooks/useV3PreviewFrameProcessor';
import type { LiveClassifierModelState, LiveClassifierPrediction } from '@/lib/camera/liveClassifierTypes';
import { formatMobileNetError } from '@/lib/camera/mobilenet/formatMobileNetError';
import { isV3CascadeEnabled } from '@/lib/camera/tflite/v3/isV3CascadeEnabled';
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
  const useV3 = isV3CascadeEnabled();
  const v3 = useV3PreviewFrameProcessor(active && useV3);
  const legacy = useLegacyEfficientNetPreview(active && !useV3);
  return useV3 ? v3 : legacy;
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
