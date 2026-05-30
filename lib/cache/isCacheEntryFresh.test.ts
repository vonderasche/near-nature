import { describe, expect, it } from 'vitest';

import { isCacheEntryFresh } from '@/lib/cache/isCacheEntryFresh';

describe('isCacheEntryFresh', () => {
  const now = 1_000_000;

  it('returns true inside the window', () => {
    expect(isCacheEntryFresh(now - 60_000, 15 * 60 * 1000, now)).toBe(true);
  });

  it('returns false when older than maxAgeMs', () => {
    expect(isCacheEntryFresh(now - 16 * 60 * 1000, 15 * 60 * 1000, now)).toBe(false);
  });

  it('returns false for invalid timestamps', () => {
    expect(isCacheEntryFresh(0, 1000, now)).toBe(false);
    expect(isCacheEntryFresh(Number.NaN, 1000, now)).toBe(false);
  });
});
