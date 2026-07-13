import { describe, expect, it } from 'vitest';



import {

  mvpPreviewModeCaption,

  nextMvpPreviewMode,

  parseMvpPreviewMode,

} from '@/lib/camera/tflite/mvp/mvpPreviewMode';



describe('mvpPreviewMode (compat re-exports)', () => {

  it('defaults to v14', () => {

    expect(parseMvpPreviewMode(null)).toBe('v14');

    expect(parseMvpPreviewMode('kingdom_global')).toBe('v14');

    expect(parseMvpPreviewMode('v14')).toBe('v14');

  });



  it('stays on v14 when cycling', () => {

    expect(nextMvpPreviewMode('v14')).toBe('v14');

  });



  it('uses preview captions', () => {

    expect(mvpPreviewModeCaption('v14')).toBe('V14');

  });

});

