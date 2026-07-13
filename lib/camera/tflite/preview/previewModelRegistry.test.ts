import { describe, expect, it } from 'vitest';



import {

  nextPreviewModelId,

  parsePreviewModelId,

  PREVIEW_MODEL_IDS,

  previewModelCaption,

} from '@/lib/camera/tflite/preview/previewModelSelection';



describe('previewModelSelection', () => {

  it('defaults to v14 for unknown or legacy persisted values', () => {

    expect(parsePreviewModelId(null)).toBe('v14');

    expect(parsePreviewModelId('unknown')).toBe('v14');

    expect(parsePreviewModelId('kingdom_v5')).toBe('v14');

    expect(parsePreviewModelId('kingdom_global')).toBe('v14');

    expect(parsePreviewModelId('n1')).toBe('v14');

    expect(parsePreviewModelId('kingdom')).toBe('v14');

    expect(parsePreviewModelId('v14')).toBe('v14');

  });



  it('cycles through all registered preview models', () => {

    let current = PREVIEW_MODEL_IDS[0]!;

    for (let i = 0; i < PREVIEW_MODEL_IDS.length; i += 1) {

      current = nextPreviewModelId(current);

    }

    expect(current).toBe(PREVIEW_MODEL_IDS[0]);

  });



  it('exposes short captions for the camera toggle', () => {

    expect(previewModelCaption('v14')).toBe('V14');

  });

});

