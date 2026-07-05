import { describe, expect, it } from 'vitest';

import {
  TAXONOMY_CHART_EXAMPLE,
  TAXONOMY_RANKS,
  taxonomyRankSummary,
} from '@/constants/taxonomy-ranks';

describe('taxonomy-ranks', () => {
  it('lists eight ranks from domain to species', () => {
    expect(TAXONOMY_RANKS.map((row) => row.id)).toEqual([
      'domain',
      'kingdom',
      'phylum',
      'class',
      'order',
      'family',
      'genus',
      'species',
    ]);
  });

  it('uses a binomial species example', () => {
    const species = TAXONOMY_RANKS.find((row) => row.id === 'species');
    expect(species?.example).toBe(TAXONOMY_CHART_EXAMPLE.scientificName);
  });

  it('builds a rank summary chain', () => {
    expect(taxonomyRankSummary()).toContain('Domain');
    expect(taxonomyRankSummary()).toContain('Species');
  });
});
