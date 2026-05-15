import { describe, expect, it } from 'vitest';

import { normalizeUsStateCode, usStateCodeFromRegion } from './us-states';

describe('us-states', () => {
  it('normalizes codes and names', () => {
    expect(normalizeUsStateCode('fl')).toBe('FL');
    expect(normalizeUsStateCode('Virginia')).toBe('VA');
    expect(normalizeUsStateCode('XX')).toBeNull();
  });

  it('maps geocode region strings', () => {
    expect(usStateCodeFromRegion('Florida')).toBe('FL');
    expect(usStateCodeFromRegion('New York')).toBe('NY');
  });
});
