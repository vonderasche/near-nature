import type { TensorflowModelDelegate } from 'react-native-fast-tflite';

import {
  evictCachedTfliteModel,
  getCachedTfliteModel,
} from '@/lib/camera/tflite/cachedModels';
import {
  allPreviewModelAssets,
  getPreviewModelDefinition,
  type PreviewModelId,
} from '@/lib/camera/tflite/preview/previewModelRegistry';

const loadPromises: Partial<Record<PreviewModelId, ReturnType<typeof getCachedTfliteModel>>> = {};

/** Keep only the active preview model resident in the TFLite cache. */
export function setActivePreviewModel(modelId: PreviewModelId): void {
  const activeAsset = getPreviewModelDefinition(modelId).modelAsset;
  for (const asset of allPreviewModelAssets()) {
    if (asset !== activeAsset) {
      evictCachedTfliteModel(asset);
    }
  }
  for (const id of Object.keys(loadPromises) as PreviewModelId[]) {
    if (id !== modelId) {
      delete loadPromises[id];
    }
  }
}

export function loadPreviewModel(modelId: PreviewModelId) {
  if (!loadPromises[modelId]) {
    const asset = getPreviewModelDefinition(modelId).modelAsset;
    loadPromises[modelId] = getCachedTfliteModel(asset);
  }
  return loadPromises[modelId]!;
}

/** Free preview models during still-photo capture to reduce peak RAM. */
export function releasePreviewModels(): void {
  for (const asset of allPreviewModelAssets()) {
    evictCachedTfliteModel(asset);
  }
  for (const key of Object.keys(loadPromises) as PreviewModelId[]) {
    delete loadPromises[key];
  }
}

export function evictPreviewModelAsset(
  modelAsset: number,
  delegates: TensorflowModelDelegate[] = [],
): void {
  evictCachedTfliteModel(modelAsset, delegates);
}

/** Brief pause so native TFLite can reclaim memory after preview eviction. */
export function yieldForTfliteMemory(ms = 120): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
