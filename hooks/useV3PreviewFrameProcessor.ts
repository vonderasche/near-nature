import { useMemo } from 'react';

import { useMlFrameProcessor } from '@/hooks/useMlFrameProcessor';
import type { LiveClassifierModelState, LiveClassifierPrediction } from '@/lib/camera/liveClassifierTypes';
import { formatMobileNetError } from '@/lib/camera/mobilenet/formatMobileNetError';
import {
  V3_ORGANISM_LABEL,
  V3_SCENE_GATE_ORGANISM_THRESHOLD,
} from '@/lib/camera/tflite/v3/v3CascadeConfig';
import { v3SceneGatePreviewConfig } from '@/lib/camera/tflite/v3/v3SceneGatePreviewConfig';

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
    config: v3SceneGatePreviewConfig,
    enabled: active,
    frameSkippingEnabled: true,
  });

  const { predictions, organismDetected } = useMemo(() => {
    if (result?.type !== 'classification') {
      return { predictions: [], organismDetected: false };
    }

    const organism = result.predictions.find((row) => row.label === V3_ORGANISM_LABEL);
    const organismConfidence = organism?.confidence ?? 0;
    const passed = organismConfidence >= V3_SCENE_GATE_ORGANISM_THRESHOLD;

    if (passed) {
      return {
        organismDetected: true,
        predictions: [
          {
            classIndex: 1,
            label: 'Organism',
            confidence: organismConfidence,
          },
        ],
      };
    }

    const notOrganism = result.predictions.find((row) => row.label !== V3_ORGANISM_LABEL);
    return {
      organismDetected: false,
      predictions: [
        {
          classIndex: 0,
          label: 'No organism',
          confidence: notOrganism?.confidence ?? 1 - organismConfidence,
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
