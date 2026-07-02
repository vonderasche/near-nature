import { describe, expect, it } from 'vitest';

import { US_STATES } from '@/constants/us-states';
import {
  DEFAULT_REGION_PACK_ID,
  REGION_EXCLUDED_STATE_CODES,
  REGION_MAPPED_STATE_CODES,
  REGION_PACK_IDS,
  REGION_PACKS,
  isRegionLive,
  regionPackForState,
  resolveRegionFromState,
} from '@/constants/regions';

const LOWER_48_CODES = US_STATES.map((s) => s.code).filter(
  (code) => !(REGION_EXCLUDED_STATE_CODES as readonly string[]).includes(code),
);

describe('region packs cover lower 48 (US Census)', () => {
  it('maps every lower-48 state to exactly one pack', () => {
    expect(REGION_MAPPED_STATE_CODES).toHaveLength(48);
    expect(REGION_MAPPED_STATE_CODES.sort()).toEqual([...LOWER_48_CODES].sort());
  });

  it('has no duplicate state assignments across packs', () => {
    const assigned = REGION_PACK_IDS.flatMap((id) => REGION_PACKS[id].states);
    expect(assigned).toHaveLength(48);
    expect(new Set(assigned).size).toBe(48);
  });

  it('uses four Census regions', () => {
    expect(REGION_PACK_IDS).toEqual(['northeast', 'midwest', 'south', 'west']);
  });
});

describe('resolveRegionFromState', () => {
  it('maps Florida and Virginia to south', () => {
    expect(resolveRegionFromState('FL')).toBe('south');
    expect(resolveRegionFromState('VA')).toBe('south');
    expect(resolveRegionFromState('TX')).toBe('south');
  });

  it('maps California and Washington to west', () => {
    expect(resolveRegionFromState('CA')).toBe('west');
    expect(resolveRegionFromState('WA')).toBe('west');
    expect(resolveRegionFromState('OR')).toBe('west');
    expect(resolveRegionFromState('CO')).toBe('west');
  });

  it('maps New England to northeast', () => {
    expect(resolveRegionFromState('ME')).toBe('northeast');
    expect(resolveRegionFromState('NH')).toBe('northeast');
    expect(resolveRegionFromState('VT')).toBe('northeast');
    expect(resolveRegionFromState('NY')).toBe('northeast');
  });

  it('maps Ohio and Iowa to midwest', () => {
    expect(resolveRegionFromState('OH')).toBe('midwest');
    expect(resolveRegionFromState('IA')).toBe('midwest');
    expect(resolveRegionFromState('IL')).toBe('midwest');
  });

  it('falls back to south for Alaska, Hawaii, and unknown', () => {
    expect(regionPackForState('AK')).toBeNull();
    expect(regionPackForState('HI')).toBeNull();
    expect(resolveRegionFromState('AK')).toBe(DEFAULT_REGION_PACK_ID);
    expect(resolveRegionFromState(null)).toBe(DEFAULT_REGION_PACK_ID);
  });
});

describe('isRegionLive', () => {
  it('only south is live in v1', () => {
    expect(isRegionLive('south')).toBe(true);
    expect(isRegionLive('west')).toBe(false);
    expect(isRegionLive('northeast')).toBe(false);
  });
});
