import { describe, expect, it } from 'vitest';

import { cyclePhotoFlashMode } from './photoFlashMode';

describe('cyclePhotoFlashMode', () => {
  it('cycles off → auto → on → off', () => {
    expect(cyclePhotoFlashMode('off')).toBe('auto');
    expect(cyclePhotoFlashMode('auto')).toBe('on');
    expect(cyclePhotoFlashMode('on')).toBe('off');
  });
});
