import { describe, expect, it, vi } from 'vitest';

import { shouldSampleEvent } from '@/lib/classification/debug/sampling';

describe('shouldSampleEvent', () => {
  it('always samples capture events', () => {
    expect(shouldSampleEvent('capture_identify')).toBe(true);
  });

  it('honors force for live preview', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(shouldSampleEvent('live_preview_sample', { force: true })).toBe(true);
    randomSpy.mockRestore();
  });

  it('samples live preview at configured rate', () => {
    const alwaysMiss = vi.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(shouldSampleEvent('live_preview_sample')).toBe(false);
    alwaysMiss.mockRestore();

    const alwaysHit = vi.spyOn(Math, 'random').mockReturnValue(0.01);
    expect(shouldSampleEvent('live_preview_sample')).toBe(true);
    alwaysHit.mockRestore();
  });
});
