import { Asset } from 'expo-asset';
import { Image } from 'react-native';
import {
  loadTensorflowModel,
  type TensorflowModelDelegate,
  type TfliteModel,
} from 'react-native-fast-tflite';

/** Serialize native model creation — concurrent loads can crash TFLite on Android. */
let modelLoadChain: Promise<unknown> = Promise.resolve();

function hasUrlProtocol(uri: string): boolean {
  return /^https?:\/\//i.test(uri) || /^file:\/\//i.test(uri);
}

async function ensureBundledAssetReady(modelAsset: number): Promise<string> {
  const { uri } = Image.resolveAssetSource(modelAsset);
  if (hasUrlProtocol(uri)) {
    return uri;
  }

  const asset = Asset.fromModule(modelAsset);
  if (!asset.downloaded) {
    await asset.downloadAsync();
  }

  const localUri = asset.localUri ?? asset.uri;
  if (!localUri) {
    throw new Error('Could not resolve on-device model file.');
  }
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

    try {
      return await loadTensorflowModel(modelAsset, delegates);
    } catch (primaryError) {
      if (hasUrlProtocol(localUri)) {
        try {
          return await loadTensorflowModel({ url: localUri }, delegates);
        } catch {
          /* try require path error below */
        }
      }

      const detail =
        primaryError instanceof Error ? primaryError.message : String(primaryError);
      throw new Error(`TFLite createModel failed: ${detail}`);
    }
  };

  const promise = modelLoadChain.then(load, load);
  modelLoadChain = promise.then(
    () => undefined,
    () => undefined,
  );
  return promise;
}
