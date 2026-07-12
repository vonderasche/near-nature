import { describe, expect, it } from 'vitest';

import {
  formatV14FamilyLabel,
  lookupFamilyCommonName,
} from '@/lib/camera/tflite/preview/v14FamilyDisplay';

describe('v14FamilyDisplay', () => {
  it('formats negative class for display', () => {
    expect(formatV14FamilyLabel('negative')).toBe('Not a target');
    expect(lookupFamilyCommonName('negative')).toBeNull();
  });

  it('adds a common name when the bundled catalog has one', () => {
    const common = lookupFamilyCommonName('Asteraceae');
    expect(common).toBeTruthy();
    expect(formatV14FamilyLabel('Asteraceae')).toBe(`Asteraceae · ${common}`);
  });

  it('falls back to the family label when no common name is known', () => {
    expect(formatV14FamilyLabel('TotallyUnknownaceae')).toBe('TotallyUnknownaceae');
  });
});
