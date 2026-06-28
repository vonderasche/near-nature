import { describe, expect, it } from 'vitest';

import {
  mvpPreviewModeCaption,
  nextMvpPreviewMode,
  parseMvpPreviewMode,
} from '@/lib/camera/tflite/mvp/mvpPreviewMode';

describe('mvpPreviewMode (compat re-exports)', () => {
  it('defaults to scene_gate', () => {
    expect(parseMvpPreviewMode(null)).toBe('scene_gate');
    expect(parseMvpPreviewMode('scene_gate')).toBe('scene_gate');
  });

  it('cycles to kingdom from scene_gate', () => {
    expect(nextMvpPreviewMode('scene_gate')).toBe('kingdom');
  });

  it('uses preview captions', () => {
    expect(mvpPreviewModeCaption('scene_gate')).toBe('Scene');
    expect(mvpPreviewModeCaption('kingdom')).toBe('Kingdom');
  });
});
