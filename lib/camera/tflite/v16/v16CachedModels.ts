import {
  getCachedTfliteModel,
  getCachedTfliteModelFromUri,
} from '@/lib/camera/tflite/cachedModels';
import type { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';
import { classifyStillImage } from '@/lib/camera/tflite/staticImageClassifier';
import type { ClassificationPrediction } from '@/lib/camera/tflite/modelTypes';
import {
  getV16FallbackModelRelativePath,
  getV16ModelConfig,
  getV16ModelRelativePath,
} from '@/lib/camera/tflite/v16/v16ModelRegistry';
import { isTflitePrepareCompatibilityError } from '@/lib/camera/tflite/tfliteErrorUtils';
import { GLOBAL_CAPTURE_STORAGE_ID } from '@/constants/modelBundles';
import { isGlobalCaptureModelBundleReady } from '@/lib/region/globalCaptureModelReadyState';
import { resolveModelBundleFileUri } from '@/lib/region/resolveRegionalModelUri';

export class V16ModelsNotDownloadedError extends Error {
  constructor() {
    super('Identification models are still downloading. Connect to the internet and try again.');
    this.name = 'V16ModelsNotDownloadedError';
  }
}

const DEV_BUNDLED_V16_FP32: number | undefined = __DEV__
  ? require('@/assets/tflite/v16/tflite/v16.tflite')
  : undefined;

const DEV_BUNDLED_V16_FP16: number | undefined = __DEV__
  ? (() => {
      try {
        return require('@/assets/tflite/v16/tflite/v16_fp16.tflite');
      } catch {
        return undefined;
      }
    })()
  : undefined;

let cachedModelPromise: Promise<Awaited<ReturnType<typeof getCachedTfliteModel>>> | null = null;

function isRecoverableTfliteLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  if (isTflitePrepareCompatibilityError(message)) {
    return true;
  }
  const normalized = message.toLowerCase();
  return (
    normalized.includes('allocate memory') &&
    (normalized.includes('input') || normalized.includes('output'))
  );
}

async function loadFromRelativePath(
  relativePath: string,
): Promise<Awaited<ReturnType<typeof getCachedTfliteModel>>> {
  const uri = await resolveModelBundleFileUri(GLOBAL_CAPTURE_STORAGE_ID, relativePath);
  if (uri) {
    return getCachedTfliteModelFromUri(uri);
  }

  if (__DEV__) {
    if (relativePath.endsWith('v16.tflite') && DEV_BUNDLED_V16_FP32 != null) {
      return getCachedTfliteModel(DEV_BUNDLED_V16_FP32);
    }
    if (relativePath.endsWith('v16_fp16.tflite') && DEV_BUNDLED_V16_FP16 != null) {
      return getCachedTfliteModel(DEV_BUNDLED_V16_FP16);
    }
  }

  throw new V16ModelsNotDownloadedError();
}

async function loadV16Model(): Promise<{
  config: ClassificationModelConfig;
  model: Awaited<ReturnType<typeof getCachedTfliteModel>>;
}> {
  const config = getV16ModelConfig();
  const primaryPath = getV16ModelRelativePath();
  const fallbackPath = getV16FallbackModelRelativePath();

  if (!cachedModelPromise) {
    cachedModelPromise = (async () => {
      try {
        return await loadFromRelativePath(primaryPath);
      } catch (primaryError) {
        if (primaryPath === fallbackPath || !isRecoverableTfliteLoadError(primaryError)) {
          throw primaryError;
        }
        return loadFromRelativePath(fallbackPath);
      }
    })();
  }

  return { config, model: await cachedModelPromise };
}

export function evictV16CachedModel(): void {
  cachedModelPromise = null;
}

export async function runV16Capture(
  imageUri: string,
): Promise<{ predictions: ClassificationPrediction[] }> {
  const { config, model } = await loadV16Model();
  const { predictions } = await classifyStillImage(imageUri, model, config);
  return { predictions };
}

export function isV16CaptureAvailable(): boolean {
  if (isGlobalCaptureModelBundleReady()) {
    return true;
  }
  return __DEV__ && (DEV_BUNDLED_V16_FP32 != null || DEV_BUNDLED_V16_FP16 != null);
}
