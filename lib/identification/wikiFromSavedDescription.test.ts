import { describe, expect, it } from 'vitest';

import { wikiFromSavedDescription } from '@/lib/identification/wikiFromSavedDescription';

describe('wikiFromSavedDescription', () => {
  it('builds wiki payload from stored description', () => {
    const wiki = wikiFromSavedDescription('A common oak.', 'Quercus alba');
    expect(wiki?.description).toBe('A common oak.');
    expect(wiki?.pageUrl).toContain('Quercus_alba');
  });

  it('returns null for empty description', () => {
    expect(wikiFromSavedDescription(null, 'Quercus alba')).toBeNull();
  });
});
