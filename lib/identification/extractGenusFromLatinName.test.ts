import { describe, expect, it } from 'vitest';

import { extractGenusFromLatinName } from '@/lib/identification/extractGenusFromLatinName';

describe('extractGenusFromLatinName', () => {
  it('returns the first token of a Latin name', () => {
    expect(extractGenusFromLatinName('Asclepias tuberosa')).toBe('Asclepias');
    expect(extractGenusFromLatinName('  Danaus plexippus  ')).toBe('Danaus');
  });

  it('returns empty string for blank input', () => {
    expect(extractGenusFromLatinName('')).toBe('');
    expect(extractGenusFromLatinName('   ')).toBe('');
  });
});
