import { describe, expect, it } from 'vitest';

import { parseAwardKeyMainCategory } from '@/lib/points/parseAwardKeyMainCategory';

describe('parseAwardKeyMainCategory', () => {
  it('maps tier and badge keys', () => {
    expect(parseAwardKeyMainCategory('main:botanist:voyager')).toBe('botanist');
    expect(parseAwardKeyMainCategory('sub:wildflowers:explorer')).toBe('botanist');
    expect(parseAwardKeyMainCategory('badge:true_voyager:mammalogist')).toBe('mammalogist');
    expect(parseAwardKeyMainCategory('badge:ends_of_the_earth')).toBe('_global');
  });

  it('returns null for unknown keys', () => {
    expect(parseAwardKeyMainCategory('other:foo')).toBeNull();
  });
});
