import { useCallback, useEffect, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { Worklets } from 'react-native-worklets-core';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { useFrameProcessor } from 'react-native-vision-camera';

import { useRegisteredTfliteModel } from '@/hooks/useRegisteredTfliteModel';
import {
  modelSupportsFrameSkipping,
} from '@/lib/camera/tflite/modelConfigs';
import type { ClassificationModelConfig, TfliteModelConfig } from '@/lib/camera/tflite/modelTypes';
import { mapRawPredictions } from '@/lib/camera/tflite/tfliteClassification';
import { devLog } from '@/lib/devLog';

export type MlClassificationResult = {
  type: 'classification';
  modelId: string;
  predictions: { label: string; confidence: number }[];
  timestamp: number;
};

type UseMlFrameProcessorOptions = {
  config: TfliteModelConfig;
  enabled: boolean;
  frameSkippingEnabled?: boolean;
};

export function useMlFrameProcessor({
  config,
  enabled,
  frameSkippingEnabled = false,
}: UseMlFrameProcessorOptions) {
  const [result, setResult] = useState<MlClassificationResult | null>(null);

  const { state, error, boxedModel } = useRegisteredTfliteModel(config, [], enabled);
  const { resize } = useResizePlugin();

  useEffect(() => {
    setResult(null);
  }, [config.id]);

  useEffect(() => {
    if (!enabled || state !== 'loaded') {
      setResult(null);
    }
  }, [enabled, state]);

  const nextInferenceAt = useSharedValue(0);
  const processorFrameCount = useSharedValue(0);

  const classificationConfig = config as ClassificationModelConfig;
  const useFrameSkipping =
    frameSkippingEnabled && modelSupportsFrameSkipping(classificationConfig);
  const frameSkipInterval = classificationConfig.frameSkipInterval ?? 10;
  const effectiveTargetFps =
    useFrameSkipping && classificationConfig.frameSkipTargetFps != null
      ? classificationConfig.frameSkipTargetFps
      : classificationConfig.targetFps;

  useEffect(() => {
    processorFrameCount.value = 0;
    nextInferenceAt.value = 0;
  }, [config.id, frameSkippingEnabled, processorFrameCount, nextInferenceAt]);

  const classificationOptions =
    config.task === 'classification'
      ? {
          directLabelIndex: classificationConfig.directLabelIndex,
          confidenceMode: classificationConfig.confidenceMode,
          softmaxOutput: classificationConfig.softmaxOutput,
          topK: classificationConfig.topK,
        }
      : undefined;

  const publishClassification = useCallback(
    (rawPredictions: { index: number; score: number }[]) => {
      if (config.task !== 'classification') return;

      setResult({
        type: 'classification',
        modelId: config.id,
        predictions: mapRawPredictions(
          rawPredictions,
          classificationConfig.labels,
          classificationOptions,
        ),
        timestamp: Date.now(),
      });
    },
    [classificationConfig.labels, classificationOptions, config.id, config.task],
  );

  const publishClassificationOnJS = Worklets.createRunOnJS(publishClassification);

  const logInferenceTimingOnJS = Worklets.createRunOnJS((modelId: string, inferenceMs: number) => {
    devLog(`[v3] ${modelId} inference ${inferenceMs.toFixed(1)}ms`);
  });

  const inputWidth = config.input.width;
  const inputHeight = config.input.height;
  const pixelFormat = config.input.pixelFormat;
  const dataType = config.input.dataType;
  const targetIntervalMs = 1000 / effectiveTargetFps;
  const outputType = classificationConfig.outputType;
  const normMean = config.input.normalization?.mean;
  const normStd = config.input.normalization?.std;
  const useNormalization = dataType === 'float32' && normMean != null && normStd != null;

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';

      if (!enabled || boxedModel == null || config.task !== 'classification') {
        return;
      }

      processorFrameCount.value += 1;

      if (useFrameSkipping && processorFrameCount.value % frameSkipInterval !== 0) {
        return;
      }

      const nowForInference = Date.now();
      if (nowForInference < nextInferenceAt.value) {
        return;
      }

      const readClassificationScoresInline = (
        output: ArrayBuffer,
        type: 'float' | 'quantized',
      ): { index: number; score: number }[] => {
        'worklet';
        const candidates: { index: number; score: number }[] = [];

        if (type === 'float') {
          const scores = new Float32Array(output);
          for (let i = 0; i < scores.length; i += 1) {
            candidates.push({ index: i, score: scores[i] ?? 0 });
          }
        } else {
          const scores = new Uint8Array(output);
          for (let i = 0; i < scores.length; i += 1) {
            candidates.push({ index: i, score: scores[i] ?? 0 });
          }
        }

        return candidates;
      };

      const normalizeRgbFloat32Inline = (
        resized: Float32Array,
        width: number,
        height: number,
        mean0: number,
        mean1: number,
        mean2: number,
        std0: number,
        std1: number,
        std2: number,
      ): ArrayBuffer => {
        'worklet';
        const pixelCount = width * height;
        const out = new Float32Array(pixelCount * 3);

        for (let i = 0; i < pixelCount; i += 1) {
          const base = i * 3;
          out[base] = ((resized[base] ?? 0) - mean0) / std0;
          out[base + 1] = ((resized[base + 1] ?? 0) - mean1) / std1;
          out[base + 2] = ((resized[base + 2] ?? 0) - mean2) / std2;
        }

        return out.buffer;
      };

      try {
        const tflite = boxedModel.unbox();
        const resized = resize(frame, {
          scale: { width: inputWidth, height: inputHeight },
          pixelFormat,
          dataType,
        });

        let inputBuffer: ArrayBuffer;
        if (useNormalization) {
          inputBuffer = normalizeRgbFloat32Inline(
            resized as Float32Array,
            inputWidth,
            inputHeight,
            normMean![0],
            normMean![1],
            normMean![2],
            normStd![0],
            normStd![1],
            normStd![2],
          );
        } else {
          const view = resized as Float32Array;
          inputBuffer = view.buffer.slice(
            view.byteOffset,
            view.byteOffset + view.byteLength,
          ) as ArrayBuffer;
        }

        const inferenceStart = Date.now();
        const outputs = tflite.runSync([inputBuffer]);
        const inferenceMs = Date.now() - inferenceStart;
        const outputBuffer = outputs[0];

        if (outputBuffer == null) {
          return;
        }

        if (config.id.startsWith('v3-')) {
          logInferenceTimingOnJS(config.id, inferenceMs);
        }

        const scores = readClassificationScoresInline(outputBuffer, outputType);
        publishClassificationOnJS(scores);

        nextInferenceAt.value = Date.now() + targetIntervalMs;
      } catch {
        /* inference errors surface via model load state */
      }
    },
    [
      enabled,
      boxedModel,
      config.task,
      inputWidth,
      inputHeight,
      pixelFormat,
      dataType,
      targetIntervalMs,
      useFrameSkipping,
      frameSkipInterval,
      processorFrameCount,
      outputType,
      useNormalization,
      normMean,
      normStd,
      resize,
      publishClassificationOnJS,
      logInferenceTimingOnJS,
      nextInferenceAt,
    ],
  );

  return {
    frameProcessor,
    result,
    modelState: state,
    modelError: error?.message ?? null,
  };
}
