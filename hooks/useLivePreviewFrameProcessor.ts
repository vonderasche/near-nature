import { useEffect, useMemo, useState } from 'react';
import { NitroModules } from 'react-native-nitro-modules';
import { useRunOnJS } from 'react-native-worklets-core';
import {
  runAtTargetFps,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { useResizePlugin } from 'vision-camera-resize-plugin';

import previewLabels from '@/assets/tflite/near_nature_app_bundle/preview_live/efficientnet_b0/tflite/labels.json';
import modelAsset from '@/assets/tflite/near_nature_app_bundle/preview_live/efficientnet_b0/tflite/efficientnet_b0_imagenet1k.tflite';
import type { LiveClassifierModelState, LiveClassifierPrediction } from '@/lib/camera/liveClassifierTypes';
import { formatMobileNetError } from '@/lib/camera/mobilenet/formatMobileNetError';
import {
  LIVE_PREVIEW_INFERENCE_FPS,
  LIVE_PREVIEW_INPUT_SIZE,
} from '@/lib/camera/mobilenet/modelConfig';
import { normalizeMobileNetInput } from '@/lib/camera/mobilenet/normalizeMobileNetInput';
import { getLabelAtIndex, type ModelLabelsJson, buildLabelLookup } from '@/lib/camera/mobilenet/parseModelLabels';
import {
  parseMobileNetTopK,
  type MobileNetPredictionScore,
} from '@/lib/camera/mobilenet/parseMobileNetOutput';
import { getCachedTfliteModel } from '@/lib/camera/mobilenet/tfliteModelRunner';

export type LivePreviewPrediction = LiveClassifierPrediction;
const PREVIEW_LABEL_LOOKUP = buildLabelLookup(previewLabels as ModelLabelsJson);

type UseLivePreviewFrameProcessorResult = {
  frameProcessor: ReturnType<typeof useFrameProcessor> | undefined;
  modelState: Exclude<LiveClassifierModelState, 'unavailable'>;
  modelError: string | null;
  predictions: LivePreviewPrediction[];
};

function labelPrediction(prediction: MobileNetPredictionScore): LivePreviewPrediction {
  return {
    ...prediction,
    label: getLabelAtIndex(PREVIEW_LABEL_LOOKUP, prediction.classIndex),
  };
}

export function useLivePreviewFrameProcessor(
  active: boolean,
): UseLivePreviewFrameProcessorResult {
  const { resize } = useResizePlugin();
  const [predictions, setPredictions] = useState<LivePreviewPrediction[]>([]);
  const [inferenceError, setInferenceError] = useState<string | null>(null);
  const [model, setModel] = useState<Awaited<ReturnType<typeof getCachedTfliteModel>>>();
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsModelLoading(true);
    setModelLoadError(null);

    getCachedTfliteModel(modelAsset)
      .then((loaded) => {
        if (cancelled) return;
        setModel(loaded);
        setIsModelLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setModel(undefined);
        setModelLoadError(formatMobileNetError(error));
        setIsModelLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const modelError = modelLoadError ?? inferenceError;
  const modelState =
    modelLoadError != null || inferenceError
      ? 'error'
      : model != null
        ? 'loaded'
        : isModelLoading
          ? 'loading'
          : 'error';

  useEffect(() => {
    if (!active) {
      setInferenceError(null);
      setPredictions([]);
    }
  }, [active]);

  const boxedModel = useMemo(
    () => (model != null ? NitroModules.box(model) : undefined),
    [model],
  );

  const publishPredictions = useRunOnJS((scores: MobileNetPredictionScore[]) => {
    setInferenceError(null);
    setPredictions(scores.map(labelPrediction));
  }, []);

  const publishInferenceError = useRunOnJS((message: string) => {
    setPredictions([]);
    setInferenceError(message);
  }, []);

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      if (!active || boxedModel == null) return;

      runAtTargetFps(LIVE_PREVIEW_INFERENCE_FPS, () => {
        'worklet';
        try {
          const tflite = boxedModel.unbox();
          const resized = resize(frame, {
            scale: {
              width: LIVE_PREVIEW_INPUT_SIZE,
              height: LIVE_PREVIEW_INPUT_SIZE,
            },
            pixelFormat: 'rgb',
            dataType: 'float32',
          });

          const normalized = normalizeMobileNetInput(resized as Float32Array);

          const outputs = tflite.runSync([normalized.buffer as ArrayBuffer]);
          const raw = outputs[0];
          if (raw == null) return;

          const top1 = parseMobileNetTopK(raw, 1);
          publishPredictions(top1);
        } catch (error) {
          publishInferenceError(formatMobileNetError(error));
        }
      });
    },
    [active, boxedModel, publishInferenceError, publishPredictions, resize],
  );

  return {
    frameProcessor: active && model != null && !inferenceError ? frameProcessor : undefined,
    modelState,
    modelError,
    predictions,
  };
}
