import { describe, expect, it } from 'vitest';

import { latinGenusForSearch, normalizeLatinNameForSearch } from '@/lib/search/normalizeLatinName';

describe('normalizeLatinNameForSearch', () => {
  it('lowercases and strips author citation', () => {
    expect(normalizeLatinNameForSearch('Panthera leo (Linnaeus, 1758)')).toBe('panthera leo');
    expect(normalizeLatinNameForSearch('Quercus alba L.')).toBe('quercus alba l.');
  });

  it('removes parenthetical notes', () => {
    expect(normalizeLatinNameForSearch('Danaus plexippus (Monarch)')).toBe('danaus plexippus');
  });

  it('extracts genus', () => {
    expect(latinGenusForSearch('Panthera leo')).toBe('panthera');
  });
});
