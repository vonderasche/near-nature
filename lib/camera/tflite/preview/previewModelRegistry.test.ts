import { describe, expect, it } from 'vitest';

import {
  nextPreviewModelId,
  parsePreviewModelId,
  PREVIEW_MODEL_IDS,
  previewModelCaption,
} from '@/lib/camera/tflite/preview/previewModelSelection';

describe('previewModelSelection', () => {
  it('defaults to scene_gate for unknown persisted values', () => {
    expect(parsePreviewModelId(null)).toBe('scene_gate');
    expect(parsePreviewModelId('unknown')).toBe('scene_gate');
    expect(parsePreviewModelId('scene_gate')).toBe('scene_gate');
  });

  it('cycles through all registered preview models', () => {
    let current = PREVIEW_MODEL_IDS[0]!;
    for (let i = 0; i < PREVIEW_MODEL_IDS.length; i += 1) {
      current = nextPreviewModelId(current);
    }
    expect(current).toBe(PREVIEW_MODEL_IDS[0]);
  });

  it('exposes short captions for the camera toggle', () => {
    expect(previewModelCaption('scene_gate')).toBe('Scene');
    expect(previewModelCaption('kingdom')).toBe('Kingdom');
    expect(previewModelCaption('routing_preview_v1')).toBe('Route');
  });
});
