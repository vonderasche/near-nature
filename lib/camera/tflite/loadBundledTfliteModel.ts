import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'react-native';
import {
  loadTensorflowModel,
  type TensorflowModelDelegate,
  type TfliteModel,
} from 'react-native-fast-tflite';

/** Serialize native model creation — concurrent loads can crash TFLite on Android. */
let modelLoadChain: Promise<unknown> = Promise.resolve();

/** Wait until all queued native model loads have finished. */
export function waitForTfliteLoadChainIdle(): Promise<void> {
  return modelLoadChain.then(() => undefined);
}

function hasUrlProtocol(uri: string): boolean {
  return /^https?:\/\//i.test(uri) || /^file:\/\//i.test(uri);
}

/** Float32 re-exports are ~2× larger than float16 sidecars baked into older dev-client APKs. */
const MVP_FLOAT32_MIN_BYTES: Record<string, number> = {
  scene_gate: 10_000_000,
  kingdom: 14_000_000,
};

async function assertMvpModelNotStaleFloat16(localUri: string): Promise<void> {
  if (!__DEV__) {
    return;
  }

  const basename = localUri.split('/').pop()?.split('?')[0] ?? '';
  const minBytes = Object.entries(MVP_FLOAT32_MIN_BYTES).find(([name]) => basename.includes(name))?.[1];
  if (minBytes == null) {
    return;
  }

  const info = await FileSystem.getInfoAsync(localUri);
  if (!info.exists || typeof info.size !== 'number' || info.size >= minBytes) {
    return;
  }

  throw new Error(
    `${basename} is ${info.size} bytes (expected float32 ≥ ${minBytes}). ` +
      'The dev client APK still has old float16 weights — run npm run android:install to rebuild, or clear app storage.',
  );
}

async function ensureBundledAssetReady(modelAsset: number): Promise<string> {
  const metroUri = Image.resolveAssetSource(modelAsset).uri;
  const asset = Asset.fromModule(modelAsset) as Asset & {
    uri: string;
    downloaded: boolean;
    localUri: string | null;
  };

  const shouldFetchFromMetro =
    __DEV__ && typeof metroUri === 'string' && /^https?:\/\//i.test(metroUri);

  if (shouldFetchFromMetro && asset.uri !== metroUri) {
    asset.uri = metroUri;
    asset.downloaded = false;
    asset.localUri = null;
  }

  if (asset.downloaded && asset.localUri?.startsWith('file://')) {
    await assertMvpModelNotStaleFloat16(asset.localUri);
    return asset.localUri;
  }

  if (shouldFetchFromMetro) {
    asset.uri = metroUri;
  }

  await asset.downloadAsync();

  const localUri = asset.localUri ?? metroUri;
  if (!localUri) {
    throw new Error('Could not resolve on-device model file.');
  }

  if (!/^file:\/\//i.test(localUri)) {
    throw new Error(
      'Model resolved to a non-local URI. Rebuild the dev client after updating .tflite assets, then reload with Metro running.',
    );
  }

  await assertMvpModelNotStaleFloat16(localUri);
  return localUri;
}

/**
 * Load a bundled .tflite (Metro `require()` module id).
 * Uses react-native-fast-tflite native AssetLoader (no JS base64) to avoid OOM on large models.
 */
export async function loadBundledTfliteModel(
  modelAsset: number,
  delegates: TensorflowModelDelegate[] = [],
): Promise<TfliteModel> {
  const load = async () => {
    const localUri = await ensureBundledAssetReady(modelAsset);
    return loadTfliteModelFromResolvedUri(localUri, delegates);
  };

  const promise = modelLoadChain.then(load, load);
  modelLoadChain = promise.then(
    () => undefined,
    () => undefined,
  );
  return promise;
}

/**
 * Load a .tflite from an on-disk `file://` or remote `http(s)://` URI (e.g. regional download cache).
 */
export async function loadTfliteModelFromUri(
  fileUri: string,
  delegates: TensorflowModelDelegate[] = [],
): Promise<TfliteModel> {
  const load = async () => loadTfliteModelFromResolvedUri(fileUri, delegates);

  const promise = modelLoadChain.then(load, load);
  modelLoadChain = promise.then(
    () => undefined,
    () => undefined,
  );
  return promise;
}

async function loadTfliteModelFromResolvedUri(
  localUri: string,
  delegates: TensorflowModelDelegate[],
): Promise<TfliteModel> {
  try {
    if (!hasUrlProtocol(localUri)) {
      throw new Error('Model file URI is missing a file/http scheme.');
    }
    return await loadTensorflowModel({ url: localUri }, delegates);
  } catch (loadError) {
    const detail = loadError instanceof Error ? loadError.message : String(loadError);
    throw new Error(`TFLite createModel failed: ${detail}`);
  }
}
