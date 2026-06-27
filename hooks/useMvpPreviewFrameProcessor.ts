import { useEffect, useMemo, useRef } from 'react';

import { useMlFrameProcessor } from '@/hooks/useMlFrameProcessor';
import type { LiveClassifierModelState, LiveClassifierPrediction } from '@/lib/camera/liveClassifierTypes';
import { formatMobileNetError } from '@/lib/camera/mobilenet/formatMobileNetError';
import {
  type MvpSceneGateDisplayState,
  mvpSceneGateDisplayStateToLabel,
  resolveMvpSceneGateDisplayState,
} from '@/lib/camera/tflite/mvp/mvpSceneGateDisplay';
import { MVP_KINGDOM_TOP1_THRESHOLD, MVP_ORGANISM_LABEL } from '@/lib/camera/tflite/mvp/mvpCaptureConfig';
import { setActiveMvpPreviewMode, releaseMvpPreviewModels } from '@/lib/camera/tflite/mvp/mvpCachedModels';
import { mvpKingdomPreviewConfig } from '@/lib/camera/tflite/mvp/mvpKingdomPreviewConfig';
import type { MvpPreviewMode } from '@/lib/camera/tflite/mvp/mvpPreviewMode';
import { mvpSceneGatePreviewConfig } from '@/lib/camera/tflite/mvp/mvpSceneGatePreviewConfig';
import { formatV3KingdomPreviewLabel } from '@/lib/camera/tflite/v3/v3Taxonomy';

type UseMvpPreviewFrameProcessorResult = {
  frameProcessor: ReturnType<typeof useMlFrameProcessor>['frameProcessor'] | undefined;
  modelState: Exclude<LiveClassifierModelState, 'unavailable'>;
  modelError: string | null;
  predictions: LiveClassifierPrediction[];
  organismDetected: boolean;
};

export function useMvpPreviewFrameProcessor(
  active: boolean,
  previewMode: MvpPreviewMode,
): UseMvpPreviewFrameProcessorResult {
  useEffect(() => {
    if (active) {
      setActiveMvpPreviewMode(previewMode);
      return;
    }
    releaseMvpPreviewModels();
  }, [active, previewMode]);

  const config =
    previewMode === 'kingdom' ? mvpKingdomPreviewConfig : mvpSceneGatePreviewConfig;

  const { frameProcessor, result, modelState, modelError } = useMlFrameProcessor({
    config,
    enabled: active,
    frameSkippingEnabled: true,
  });

  const sceneGateDisplayStateRef = useRef<MvpSceneGateDisplayState>('searching');

  useEffect(() => {
    if (!active || previewMode !== 'scene_gate') {
      sceneGateDisplayStateRef.current = 'searching';
    }
  }, [active, previewMode]);

  const { predictions, organismDetected } = useMemo(() => {
    if (result?.type !== 'classification') {
      return { predictions: [], organismDetected: false };
    }

    if (previewMode === 'kingdom') {
      const sorted = [...result.predictions].sort((a, b) => b.confidence - a.confidence);
      const top = sorted[0];
      if (!top) {
        return { predictions: [], organismDetected: false };
      }

      const confident = top.confidence >= MVP_KINGDOM_TOP1_THRESHOLD && top.label !== 'uncertain';
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
    }

    const organismRow = result.predictions.find((row) => row.label === MVP_ORGANISM_LABEL);
    const organismConfidence = organismRow?.confidence ?? 0;
    const displayState = resolveMvpSceneGateDisplayState(
      organismConfidence,
      sceneGateDisplayStateRef.current,
    );
    sceneGateDisplayStateRef.current = displayState;

    return {
      organismDetected: displayState === 'found',
      predictions: [
        {
          classIndex: 0,
          label: mvpSceneGateDisplayStateToLabel(displayState),
          confidence: organismConfidence,
        },
      ],
    };
  }, [previewMode, result]);

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
