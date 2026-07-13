import {
  DEFAULT_PREVIEW_MODEL_ID,
  type PreviewModelId,
} from '@/lib/camera/tflite/preview/previewModelIds';

/** Toggle order on the camera screen (must match `PREVIEW_MODEL_DEFINITIONS` in registry). */
export const PREVIEW_MODEL_IDS: PreviewModelId[] = ['v14'];

const SHORT_NAMES: Record<PreviewModelId, string> = {
  v14: 'V14',
};

/** Persisted preview ids from older builds — map to the current preview model. */
const LEGACY_PREVIEW_MODEL_IDS = new Set([
  'kingdom_global',
  'kingdom_v5',
  'kingdom',
  'n1',
  'scene_gate',
]);

export { DEFAULT_PREVIEW_MODEL_ID };

export function parsePreviewModelId(raw: string | null): PreviewModelId {
  if (raw === 'v14') {
    return 'v14';
  }
  if (raw && LEGACY_PREVIEW_MODEL_IDS.has(raw)) {
    return DEFAULT_PREVIEW_MODEL_ID;
  }
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
