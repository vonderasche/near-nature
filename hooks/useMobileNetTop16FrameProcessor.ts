import { useEffect, useMemo, useState } from 'react';
import { NitroModules } from 'react-native-nitro-modules';
import { useRunOnJS } from 'react-native-worklets-core';
import { useTensorflowModel } from 'react-native-fast-tflite';
import {
  runAtTargetFps,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { useResizePlugin } from 'vision-camera-resize-plugin';

import modelAsset from '@/assets/tflite/mobilenetv3_small_top16_groups/tflite/species_classifier.tflite';
import type { LiveClassifierModelState, LiveClassifierPrediction } from '@/lib/camera/liveClassifierTypes';
import { formatMobileNetError } from '@/lib/camera/mobilenet/formatMobileNetError';
import {
  MOBILENET_TOP16_INFERENCE_FPS,
  MOBILENET_TOP16_INPUT_SIZE,
} from '@/lib/camera/mobilenet/modelConfig';
import { normalizeMobileNetInput } from '@/lib/camera/mobilenet/normalizeMobileNetInput';
import { getMobileNetTop16GroupLabel } from '@/lib/camera/mobilenet/top16GroupLabels';
import {
  parseMobileNetTop3,
  type MobileNetPredictionScore,
} from '@/lib/camera/mobilenet/parseMobileNetOutput';

export type MobileNetLivePrediction = LiveClassifierPrediction;

type UseMobileNetTop16FrameProcessorResult = {
  frameProcessor: ReturnType<typeof useFrameProcessor> | undefined;
  modelState: Exclude<LiveClassifierModelState, 'unavailable'>;
  modelError: string | null;
  predictions: MobileNetLivePrediction[];
};

function labelPrediction(prediction: MobileNetPredictionScore): MobileNetLivePrediction {
  return {
    ...prediction,
    label: getMobileNetTop16GroupLabel(prediction.classIndex),
  };
}

export function useMobileNetTop16FrameProcessor(
  active: boolean,
): UseMobileNetTop16FrameProcessorResult {
  const tf = useTensorflowModel(modelAsset, []);
  const { resize } = useResizePlugin();
  const [predictions, setPredictions] = useState<MobileNetLivePrediction[]>([]);
  const [inferenceError, setInferenceError] = useState<string | null>(null);

  const model = tf.state === 'loaded' ? tf.model : undefined;
  const modelError = tf.state === 'error' ? formatMobileNetError(tf.error) : inferenceError;
  const modelState =
    tf.state === 'error' || inferenceError
      ? 'error'
      : tf.state === 'loaded'
        ? 'loaded'
        : 'loading';

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

      runAtTargetFps(MOBILENET_TOP16_INFERENCE_FPS, () => {
        'worklet';
        try {
          const tflite = boxedModel.unbox();
          const resized = resize(frame, {
            scale: {
              width: MOBILENET_TOP16_INPUT_SIZE,
              height: MOBILENET_TOP16_INPUT_SIZE,
            },
            pixelFormat: 'rgb',
            dataType: 'float32',
          });

          const normalized = normalizeMobileNetInput(resized as Float32Array);

          const outputs = tflite.runSync([normalized.buffer as ArrayBuffer]);
          const raw = outputs[0];
          if (raw == null) return;

          const top3 = parseMobileNetTop3(raw);
          publishPredictions(top3);
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
