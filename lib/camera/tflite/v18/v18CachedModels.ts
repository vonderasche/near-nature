import {
  getCachedTfliteModel,
  getCachedTfliteModelFromUri,
} from '@/lib/camera/tflite/cachedModels';
import type { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';
import { classifyStillImage } from '@/lib/camera/tflite/staticImageClassifier';
import type { ClassificationPrediction } from '@/lib/camera/tflite/modelTypes';
import {
  getV18FallbackModelRelativePath,
  getV18ModelConfig,
  getV18ModelRelativePath,
} from '@/lib/camera/tflite/v18/v18ModelRegistry';
import { isTflitePrepareCompatibilityError } from '@/lib/camera/tflite/tfliteErrorUtils';
import { GLOBAL_CAPTURE_STORAGE_ID } from '@/constants/modelBundles';
import { isGlobalCaptureModelBundleReady } from '@/lib/region/globalCaptureModelReadyState';
import { resolveModelBundleFileUri } from '@/lib/region/resolveRegionalModelUri';

export class V18ModelsNotDownloadedError extends Error {
  constructor() {
    super('Identification models are still downloading. Connect to the internet and try again.');
    this.name = 'V18ModelsNotDownloadedError';
  }
}

const DEV_BUNDLED_V18_FP32: number | undefined = __DEV__
  ? require('@/assets/tflite/v18/tflite/v18.tflite')
  : undefined;

const DEV_BUNDLED_V18_FP16: number | undefined = __DEV__
  ? (() => {
      try {
        return require('@/assets/tflite/v18/tflite/v18_fp16.tflite');
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
    if (relativePath.endsWith('v18.tflite') && DEV_BUNDLED_V18_FP32 != null) {
      return getCachedTfliteModel(DEV_BUNDLED_V18_FP32);
    }
    if (relativePath.endsWith('v18_fp16.tflite') && DEV_BUNDLED_V18_FP16 != null) {
      return getCachedTfliteModel(DEV_BUNDLED_V18_FP16);
    }
  }

  throw new V18ModelsNotDownloadedError();
}

async function loadV18Model(): Promise<{
  config: ClassificationModelConfig;
  model: Awaited<ReturnType<typeof getCachedTfliteModel>>;
}> {
  const config = getV18ModelConfig();
  const primaryPath = getV18ModelRelativePath();
  const fallbackPath = getV18FallbackModelRelativePath();

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

export function evictV18CachedModel(): void {
  cachedModelPromise = null;
}

export async function runV18Capture(
  imageUri: string,
): Promise<{ predictions: ClassificationPrediction[] }> {
  const { config, model } = await loadV18Model();
  const { predictions } = await classifyStillImage(imageUri, model, config);
  return { predictions };
}

export function isV18CaptureAvailable(): boolean {
  if (isGlobalCaptureModelBundleReady()) {
    return true;
  }
  return __DEV__ && (DEV_BUNDLED_V18_FP32 != null || DEV_BUNDLED_V18_FP16 != null);
}
