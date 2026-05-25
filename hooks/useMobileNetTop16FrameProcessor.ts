import { useCallback, useMemo, useState } from 'react';
import { NitroModules } from 'react-native-nitro-modules';
import { runOnJS } from 'react-native-reanimated';
import { useTensorflowModel } from 'react-native-fast-tflite';
import {
  runAtTargetFps,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { useResizePlugin } from 'vision-camera-resize-plugin';

import modelAsset from '@/assets/tflite/mobilenetv3_small_top16_groups/tflite/species_classifier.tflite';
import { getMobileNetTop16GroupLabel } from '@/lib/camera/mobilenet/top16GroupLabels';
import {
  parseMobileNetTop3,
  type MobileNetPredictionScore,
} from '@/lib/camera/mobilenet/parseMobileNetOutput';

const INPUT_SIZE = 224;
const INFERENCE_FPS = 2;
const IMAGENET_MEAN = [0.485, 0.456, 0.406] as const;
const IMAGENET_STD = [0.229, 0.224, 0.225] as const;

export type MobileNetLivePrediction = {
  label: string;
  confidence: number;
  classIndex: number;
};

type UseMobileNetTop16FrameProcessorResult = {
  frameProcessor: ReturnType<typeof useFrameProcessor> | undefined;
  modelState: 'loading' | 'loaded' | 'error';
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

  const model = tf.state === 'loaded' ? tf.model : undefined;
  const modelState = tf.state === 'loaded' ? 'loaded' : tf.state === 'error' ? 'error' : 'loading';
  const modelError = tf.state === 'error' ? tf.error.message : null;

  const boxedModel = useMemo(
    () => (model != null ? NitroModules.box(model) : undefined),
    [model],
  );

  const publishPredictions = useCallback((scores: MobileNetPredictionScore[]) => {
    setPredictions(scores.map(labelPrediction));
  }, []);

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      if (!active || boxedModel == null) return;

      runAtTargetFps(INFERENCE_FPS, () => {
        'worklet';
        const tflite = boxedModel.unbox();
        const resized = resize(frame, {
          scale: { width: INPUT_SIZE, height: INPUT_SIZE },
          pixelFormat: 'rgb',
          dataType: 'float32',
        });

        const input = resized as Float32Array;
        const normalized = new Float32Array(input.length);
        for (let i = 0; i < input.length; i += 3) {
          normalized[i] = ((input[i] ?? 0) / 255 - IMAGENET_MEAN[0]) / IMAGENET_STD[0];
          normalized[i + 1] = ((input[i + 1] ?? 0) / 255 - IMAGENET_MEAN[1]) / IMAGENET_STD[1];
          normalized[i + 2] = ((input[i + 2] ?? 0) / 255 - IMAGENET_MEAN[2]) / IMAGENET_STD[2];
        }

        const outputs = tflite.runSync([normalized.buffer]);
        const raw = outputs[0];
        if (raw == null) return;

        const top3 = parseMobileNetTop3(raw);
        runOnJS(publishPredictions)(top3);
      });
    },
    [active, boxedModel, publishPredictions, resize],
  );

  return {
    frameProcessor: active && model != null ? frameProcessor : undefined,
    modelState,
    modelError,
    predictions,
  };
}
