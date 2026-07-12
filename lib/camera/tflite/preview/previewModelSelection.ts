import {
  DEFAULT_PREVIEW_MODEL_ID,
  type PreviewModelId,
} from '@/lib/camera/tflite/preview/previewModelIds';

/** Toggle order on the camera screen (must match `PREVIEW_MODEL_DEFINITIONS` in registry). */
export const PREVIEW_MODEL_IDS: PreviewModelId[] = ['kingdom_global', 'n1', 'kingdom'];

const SHORT_NAMES: Record<PreviewModelId, string> = {
  kingdom_global: 'Kingdom',
  n1: 'N1',
  kingdom: 'Kingdom (legacy)',
};

export { DEFAULT_PREVIEW_MODEL_ID };

export function parsePreviewModelId(raw: string | null): PreviewModelId {
  if (raw === 'kingdom_v5') {
    return 'kingdom_global';
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
