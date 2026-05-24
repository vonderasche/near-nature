import { useCallback, useMemo, useState } from 'react';
import { NitroModules } from 'react-native-nitro-modules';
import { runOnJS } from 'react-native-reanimated';
import { useTensorflowModel } from 'react-native-fast-tflite';
import {
  runAtTargetFps,
  useFrameProcessor,
  type FrameProcessor,
} from 'react-native-vision-camera';
import { useResizePlugin } from 'vision-camera-resize-plugin';

import { getImageNetLabel } from '@/lib/camera/mobilenet/imagenetLabels';
import { parseMobileNetTop1 } from '@/lib/camera/mobilenet/parseMobileNetOutput';

const MOBILENET_MODEL = require('@/assets/tflite/mobilenet_v2_224_quant.tflite');
const INPUT_SIZE = 224;
const INFERENCE_FPS = 2;

export type MobileNetDebugState = {
  label: string;
  confidence: number;
  classIndex: number;
  inferenceMs: number;
};

type WorkletResult = {
  classIndex: number;
  confidence: number;
  inferenceMs: number;
};

type UseMobileNetFrameProcessorResult = {
  frameProcessor: FrameProcessor | undefined;
  modelState: 'loading' | 'loaded' | 'error';
  modelError: string | null;
  debug: MobileNetDebugState | null;
};

/**
 * Live MobileNet inference on camera frames. Mount only when
 * {@link isMobileNetFrameProcessorEnabled} is true.
 */
export function useMobileNetFrameProcessor(active: boolean): UseMobileNetFrameProcessorResult {
  const tf = useTensorflowModel(MOBILENET_MODEL, []);
  const { resize } = useResizePlugin();
  const [debug, setDebug] = useState<MobileNetDebugState | null>(null);

  const model = tf.state === 'loaded' ? tf.model : undefined;
  const modelState = tf.state === 'loaded' ? 'loaded' : tf.state === 'error' ? 'error' : 'loading';
  const modelError = tf.state === 'error' ? tf.error.message : null;

  const boxedModel = useMemo(
    () => (model != null ? NitroModules.box(model) : undefined),
    [model],
  );

  const publishDebug = useCallback((partial: WorkletResult) => {
    setDebug({
      ...partial,
      label: getImageNetLabel(partial.classIndex),
    });
  }, []);

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      if (!active || boxedModel == null) return;

      runAtTargetFps(INFERENCE_FPS, () => {
        const tflite = boxedModel.unbox();
        const resized = resize(frame, {
          scale: { width: INPUT_SIZE, height: INPUT_SIZE },
          pixelFormat: 'rgb',
          dataType: 'uint8',
        });

        const inputBuffer = resized.buffer.slice(
          resized.byteOffset,
          resized.byteOffset + resized.byteLength,
        );

        const started = Date.now();
        const outputs = tflite.runSync([inputBuffer]);
        const inferenceMs = Date.now() - started;

        const raw = outputs[0];
        if (raw == null) return;

        const { classIndex, confidence } = parseMobileNetTop1(raw);
        runOnJS(publishDebug)({ classIndex, confidence, inferenceMs });
      });
    },
    [active, boxedModel, publishDebug, resize],
  );

  return {
    frameProcessor: active && model != null ? frameProcessor : undefined,
    modelState,
    modelError,
    debug,
  };
}
