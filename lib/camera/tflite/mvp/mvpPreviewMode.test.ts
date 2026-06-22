import { describe, expect, it } from 'vitest';

import {
  mvpPreviewModeCaption,
  nextMvpPreviewMode,
  parseMvpPreviewMode,
} from '@/lib/camera/tflite/mvp/mvpPreviewMode';

describe('mvpPreviewMode', () => {
  it('defaults to scene gate', () => {
    expect(parseMvpPreviewMode(null)).toBe('scene_gate');
    expect(parseMvpPreviewMode('scene_gate')).toBe('scene_gate');
  });

  it('parses kingdom mode', () => {
    expect(parseMvpPreviewMode('kingdom')).toBe('kingdom');
  });

  it('cycles preview modes', () => {
    expect(nextMvpPreviewMode('scene_gate')).toBe('kingdom');
    expect(nextMvpPreviewMode('kingdom')).toBe('scene_gate');
  });

  it('labels captions', () => {
    expect(mvpPreviewModeCaption('scene_gate')).toBe('Scene');
    expect(mvpPreviewModeCaption('kingdom')).toBe('Kingdom');
  });
});
