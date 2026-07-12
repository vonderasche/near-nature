import { describe, expect, it } from 'vitest';

import {
  nextPreviewModelId,
  parsePreviewModelId,
  PREVIEW_MODEL_IDS,
  previewModelCaption,
} from '@/lib/camera/tflite/preview/previewModelSelection';

describe('previewModelSelection', () => {
  it('defaults to kingdom_global for unknown persisted values', () => {
    expect(parsePreviewModelId(null)).toBe('kingdom_global');
    expect(parsePreviewModelId('unknown')).toBe('kingdom_global');
    expect(parsePreviewModelId('kingdom_v5')).toBe('kingdom_global');
    expect(parsePreviewModelId('kingdom_global')).toBe('kingdom_global');
    expect(parsePreviewModelId('n1')).toBe('n1');
  });

  it('cycles through all registered preview models', () => {
    let current = PREVIEW_MODEL_IDS[0]!;
    for (let i = 0; i < PREVIEW_MODEL_IDS.length; i += 1) {
      current = nextPreviewModelId(current);
    }
    expect(current).toBe(PREVIEW_MODEL_IDS[0]);
  });

  it('exposes short captions for the camera toggle', () => {
    expect(previewModelCaption('kingdom_global')).toBe('Kingdom');
    expect(previewModelCaption('n1')).toBe('N1');
    expect(previewModelCaption('kingdom')).toBe('Kingdom (legacy)');
  });
});
