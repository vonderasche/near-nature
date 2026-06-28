export {
  loadPreviewModel as loadMvpSceneGateModel,
  releasePreviewModels as releaseMvpPreviewModels,
  setActivePreviewModel as setActiveMvpPreviewMode,
  yieldForTfliteMemory,
} from '@/lib/camera/tflite/preview/previewCachedModels';

import { getPreviewModelDefinition } from '@/lib/camera/tflite/preview/previewModelRegistry';
import {
  evictCachedTfliteModel,
  getCachedTfliteModel,
} from '@/lib/camera/tflite/cachedModels';

export type { PreviewModelId as MvpPreviewMode } from '@/lib/camera/tflite/preview/previewModelIds';

let kingdomPromise: ReturnType<typeof getCachedTfliteModel> | null = null;

/** @deprecated Use `loadPreviewModel('kingdom')` */
export function loadMvpKingdomModel() {
  if (!kingdomPromise) {
    kingdomPromise = getCachedTfliteModel(getPreviewModelDefinition('kingdom').modelAsset);
  }
  return kingdomPromise;
}

export { evictPreviewModelAsset as evictMvpModelAsset } from '@/lib/camera/tflite/preview/previewCachedModels';
