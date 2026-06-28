import { describe, expect, it } from 'vitest';

import {
  DEFAULT_REGION_PACK_ID,
  isRegionLive,
  resolveRegionFromState,
} from '@/constants/regions';

describe('resolveRegionFromState', () => {
  it('maps Florida to southeast', () => {
    expect(resolveRegionFromState('FL')).toBe('southeast');
  });

  it('maps California to southwest', () => {
    expect(resolveRegionFromState('CA')).toBe('southwest');
  });

  it('maps Ohio to midwest (not northeast partial)', () => {
    expect(resolveRegionFromState('OH')).toBe('midwest');
  });

  it('falls back to southeast for unknown state', () => {
    expect(resolveRegionFromState('AK')).toBe(DEFAULT_REGION_PACK_ID);
    expect(resolveRegionFromState(null)).toBe(DEFAULT_REGION_PACK_ID);
  });
});

describe('isRegionLive', () => {
  it('only southeast is live in v1', () => {
    expect(isRegionLive('southeast')).toBe(true);
    expect(isRegionLive('southwest')).toBe(false);
  });
});
