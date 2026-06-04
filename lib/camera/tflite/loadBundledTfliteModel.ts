import { Asset } from 'expo-asset';
import { Image } from 'react-native';
import { NitroModules } from 'react-native-nitro-modules';
import {
  loadTensorflowModel,
  type TensorflowModelDelegate,
  type TfliteModel,
} from 'react-native-fast-tflite';
import { decode } from 'base64-arraybuffer';

import { readLocalFileAsBase64 } from '@/lib/fs/legacyFileSystem';

type TfliteModuleHybrid = {
  createModel(
    modelData: ArrayBuffer,
    delegates: TensorflowModelDelegate[],
  ): TfliteModel;
};

const tfliteModule = NitroModules.createHybridObject('TfliteModule') as unknown as TfliteModuleHybrid;

/** Serialize native model creation — concurrent loads can crash TFLite on Android. */
let modelLoadChain: Promise<unknown> = Promise.resolve();

function hasUrlProtocol(uri: string): boolean {
  return /^https?:\/\//i.test(uri) || /^file:\/\//i.test(uri);
}

async function resolveBundledModelUri(modelAsset: number): Promise<string> {
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

async function readModelArrayBuffer(uri: string): Promise<ArrayBuffer> {
  if (/^https?:\/\//i.test(uri)) {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to download on-device model (${response.status}).`);
    }
    return response.arrayBuffer();
  }

  if (hasUrlProtocol(uri)) {
    try {
      const response = await fetch(uri);
      if (response.ok) {
        return response.arrayBuffer();
      }
    } catch {
      /* fetch(file://) may fail on some Android builds */
    }
  }

  const base64 = await readLocalFileAsBase64(uri);
  return decode(base64);
}

async function createModelFromUri(
  uri: string,
  delegates: TensorflowModelDelegate[],
): Promise<TfliteModel> {
  if (hasUrlProtocol(uri)) {
    try {
      return await loadTensorflowModel({ url: uri }, delegates);
    } catch {
      /* fall through to byte loader (release asset names, file:// edge cases) */
    }
  }

  const modelData = await readModelArrayBuffer(uri);
  return tfliteModule.createModel(modelData, delegates);
}

/**
 * Load a bundled .tflite (Metro `require()` module id).
 * Uses fast `loadTensorflowModel({ url })` when possible; falls back to byte loading for release APKs.
 */
export async function loadBundledTfliteModel(
  modelAsset: number,
  delegates: TensorflowModelDelegate[] = [],
): Promise<TfliteModel> {
  const load = async () => {
    const uri = await resolveBundledModelUri(modelAsset);
    try {
      return await createModelFromUri(uri, delegates);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
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
