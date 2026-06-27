import { describe, expect, it } from 'vitest';

import { resolveMvpSceneGateDisplayState } from '@/lib/camera/tflite/mvp/mvpSceneGateDisplay';

describe('mvpSceneGateDisplay', () => {
  it('latches scene gate display until confidence drops below release threshold', () => {
    expect(resolveMvpSceneGateDisplayState(0.75, 'searching')).toBe('found');
    expect(resolveMvpSceneGateDisplayState(0.5, 'found')).toBe('found');
    expect(resolveMvpSceneGateDisplayState(0.4, 'found')).toBe('found');
    expect(resolveMvpSceneGateDisplayState(0.3, 'found')).toBe('searching');
  });
});
