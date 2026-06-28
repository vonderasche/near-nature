import {
  DEFAULT_PREVIEW_MODEL_ID,
  type PreviewModelId,
} from '@/lib/camera/tflite/preview/previewModelIds';

/** Toggle order on the camera screen (must match `PREVIEW_MODEL_DEFINITIONS` in registry). */
export const PREVIEW_MODEL_IDS: PreviewModelId[] = [
  'scene_gate',
  'kingdom',
  'routing_preview_v1',
  'efficientnet_b0_imagenet',
  'efficientnet_lite0_imagenet',
  'efficientnet_lite2_imagenet',
  'mobilenet_v2_imagenet',
];

const SHORT_NAMES: Record<PreviewModelId, string> = {
  scene_gate: 'Scene',
  kingdom: 'Kingdom',
  routing_preview_v1: 'Route',
  efficientnet_b0_imagenet: 'EN-B0',
  efficientnet_lite0_imagenet: 'EN-L0',
  efficientnet_lite2_imagenet: 'EN-L2',
  mobilenet_v2_imagenet: 'MN-V2',
};

export { DEFAULT_PREVIEW_MODEL_ID };

export function parsePreviewModelId(raw: string | null): PreviewModelId {
  if (raw && (PREVIEW_MODEL_IDS as readonly string[]).includes(raw)) {
    return raw as PreviewModelId;
  }
  return DEFAULT_PREVIEW_MODEL_ID;
}

export function nextPreviewModelId(current: PreviewModelId): PreviewModelId {
  const index = PREVIEW_MODEL_IDS.indexOf(current);
  const next = index < 0 ? 0 : (index + 1) % PREVIEW_MODEL_IDS.length;
  return PREVIEW_MODEL_IDS[next]!;
}

export function previewModelCaption(id: PreviewModelId): string {
  return SHORT_NAMES[id];
}
