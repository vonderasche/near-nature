import { describe, expect, it } from 'vitest';

import {
  LEGACY_REGION_PACK_ALIASES,
  getRegionModelStorageCandidates,
  normalizeRegionPackId,
} from '@/lib/region/regionPackLegacy';

describe('normalizeRegionPackId', () => {
  it('accepts Census region ids', () => {
    expect(normalizeRegionPackId('south')).toBe('south');
    expect(normalizeRegionPackId('west')).toBe('west');
  });

  it('maps retired 5-region ids to Census regions', () => {
    expect(normalizeRegionPackId('southeast')).toBe('south');
    expect(normalizeRegionPackId('southwest')).toBe('west');
    expect(normalizeRegionPackId('northwest')).toBe('west');
    expect(LEGACY_REGION_PACK_ALIASES.southeast).toBe('south');
  });

  it('returns null for unknown values', () => {
    expect(normalizeRegionPackId('invalid')).toBeNull();
    expect(normalizeRegionPackId(null)).toBeNull();
  });
});

describe('getRegionModelStorageCandidates', () => {
  it('checks legacy southeast folder for south', () => {
    expect(getRegionModelStorageCandidates('south')).toEqual(['south', 'southeast']);
  });

  it('checks legacy southwest and northwest folders for west', () => {
    expect(getRegionModelStorageCandidates('west')).toEqual(['west', 'southwest', 'northwest']);
  });
});
