import { useMemo } from 'react';

import { useMlFrameProcessor } from '@/hooks/useMlFrameProcessor';
import type { LiveClassifierModelState, LiveClassifierPrediction } from '@/lib/camera/liveClassifierTypes';
import { formatMobileNetError } from '@/lib/camera/mobilenet/formatMobileNetError';
import { V3_KINGDOM_TOP1_THRESHOLD } from '@/lib/camera/tflite/v3/v3CascadeConfig';
import { v3KingdomPreviewConfig } from '@/lib/camera/tflite/v3/v3KingdomPreviewConfig';
import { formatV3KingdomPreviewLabel } from '@/lib/camera/tflite/v3/v3Taxonomy';

type UseV3PreviewFrameProcessorResult = {
  frameProcessor: ReturnType<typeof useMlFrameProcessor>['frameProcessor'] | undefined;
  modelState: Exclude<LiveClassifierModelState, 'unavailable'>;
  modelError: string | null;
  predictions: LiveClassifierPrediction[];
  organismDetected: boolean;
};

export function useV3PreviewFrameProcessor(
  active: boolean,
): UseV3PreviewFrameProcessorResult {
  const { frameProcessor, result, modelState, modelError } = useMlFrameProcessor({
    config: v3KingdomPreviewConfig,
    enabled: active,
    frameSkippingEnabled: true,
  });

  const { predictions, organismDetected } = useMemo(() => {
    if (result?.type !== 'classification') {
      return { predictions: [], organismDetected: false };
    }

    const sorted = [...result.predictions].sort((a, b) => b.confidence - a.confidence);
    const top = sorted[0];
    if (!top) {
      return { predictions: [], organismDetected: false };
    }

    const confident =
      top.confidence >= V3_KINGDOM_TOP1_THRESHOLD && top.label !== 'uncertain';

    return {
      organismDetected: confident,
      predictions: [
        {
          classIndex: 0,
          label: formatV3KingdomPreviewLabel(top.label),
          confidence: top.confidence,
        },
      ],
    };
  }, [result]);

  const resolvedModelState: Exclude<LiveClassifierModelState, 'unavailable'> =
    modelState === 'loaded' ? 'loaded' : modelState === 'loading' ? 'loading' : 'error';

  return {
    frameProcessor:
      active && modelState === 'loaded' && modelError == null ? frameProcessor : undefined,
    modelState: resolvedModelState,
    modelError: modelError != null ? formatMobileNetError(modelError) : null,
    predictions,
    organismDetected,
  };
}
