import type { TensorflowModelDelegate } from 'react-native-fast-tflite';

import { MVP_MODEL_ASSETS } from '@/lib/camera/tflite/mvp/mvpCaptureConfig';
import {
  evictCachedTfliteModel,
  getCachedTfliteModel,
} from '@/lib/camera/tflite/cachedModels';
export type MvpPreviewMode = 'scene_gate' | 'kingdom';

let sceneGatePromise: ReturnType<typeof getCachedTfliteModel> | null = null;
let kingdomPromise: ReturnType<typeof getCachedTfliteModel> | null = null;

/** Drop the inactive live-preview model so scene gate and kingdom are not both resident. */
export function setActiveMvpPreviewMode(mode: MvpPreviewMode): void {
  if (mode === 'scene_gate') {
    evictCachedTfliteModel(MVP_MODEL_ASSETS.kingdom);
    kingdomPromise = null;
    return;
  }
  evictCachedTfliteModel(MVP_MODEL_ASSETS.sceneGate);
  sceneGatePromise = null;
}

export function loadMvpSceneGateModel() {
  if (!sceneGatePromise) {
    sceneGatePromise = getCachedTfliteModel(MVP_MODEL_ASSETS.sceneGate);
  }
  return sceneGatePromise;
}

export function loadMvpKingdomModel() {
  if (!kingdomPromise) {
    kingdomPromise = getCachedTfliteModel(MVP_MODEL_ASSETS.kingdom);
  }
  return kingdomPromise;
}

/** Free preview models during still-photo capture to reduce peak RAM. */
export function releaseMvpPreviewModels(): void {
  evictCachedTfliteModel(MVP_MODEL_ASSETS.sceneGate);
  evictCachedTfliteModel(MVP_MODEL_ASSETS.kingdom);
  sceneGatePromise = null;
  kingdomPromise = null;
}

/** Brief pause so native TFLite can reclaim memory after preview eviction. */
export function yieldForTfliteMemory(ms = 120): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function evictMvpModelAsset(
  modelAsset: number,
  delegates: TensorflowModelDelegate[] = [],
): void {
  evictCachedTfliteModel(modelAsset, delegates);
}
