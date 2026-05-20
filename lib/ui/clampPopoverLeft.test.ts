import { describe, expect, it } from 'vitest';

import { clampPopoverLeft } from '@/lib/ui/clampPopoverLeft';

describe('clampPopoverLeft', () => {
  it('centers under anchor when there is room', () => {
    expect(clampPopoverLeft(100, 40, 120, 400, 8)).toBe(60);
  });

  it('clamps to left inset when centered would overflow', () => {
    expect(clampPopoverLeft(16, 72, 220, 390, 8)).toBe(8);
  });

  it('clamps to right inset when centered would overflow', () => {
    expect(clampPopoverLeft(300, 72, 220, 390, 8)).toBe(162);
  });
});
