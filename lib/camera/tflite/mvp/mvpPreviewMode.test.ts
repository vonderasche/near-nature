import { describe, expect, it } from 'vitest';

import {
  mvpPreviewModeCaption,
  nextMvpPreviewMode,
  parseMvpPreviewMode,
} from '@/lib/camera/tflite/mvp/mvpPreviewMode';

describe('mvpPreviewMode (compat re-exports)', () => {
  it('defaults to kingdom_global', () => {
    expect(parseMvpPreviewMode(null)).toBe('kingdom_global');
    expect(parseMvpPreviewMode('kingdom_global')).toBe('kingdom_global');
  });

  it('cycles to legacy kingdom from kingdom_global', () => {
    expect(nextMvpPreviewMode('kingdom_global')).toBe('kingdom');
  });

  it('uses preview captions', () => {
    expect(mvpPreviewModeCaption('kingdom_global')).toBe('Kingdom');
    expect(mvpPreviewModeCaption('kingdom')).toBe('Kingdom (legacy)');
  });
});
