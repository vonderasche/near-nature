import { getPreviewModelConfig } from '@/lib/camera/tflite/preview/previewModelRegistry';

/** @deprecated Use `getPreviewModelConfig('scene_gate')` */
export const mvpSceneGatePreviewConfig = getPreviewModelConfig('scene_gate');
