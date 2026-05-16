import { describe, expect, it } from 'vitest';

import {
  exploreSpeciesMeta,
  exploreSpeciesTitle,
} from '@/lib/explore/formatExploreSpeciesDisplay';
import type { ExploreSpecies } from '@/lib/explore/exploreSpeciesTypes';

const sample: ExploreSpecies = {
  id: '1',
  inaturalistId: 1,
  latinName: 'Anas platyrhynchos',
  commonName: 'Mallard',
  type: 'animals',
  iconicTaxonName: 'Aves',
  observationsCount: 1000,
  rank: 3,
  state: 'Florida',
  wikipediaUrl: null,
  imageUrl: null,
  wikiSummary: null,
  wikiImageUrl: null,
  isFeatured: false,
  bonusPoints: 5,
};

describe('formatExploreSpeciesDisplay', () => {
  it('formats title with rank', () => {
    expect(exploreSpeciesTitle(sample)).toBe('#3 · Mallard');
  });

  it('formats meta with bonus', () => {
    expect(exploreSpeciesMeta(sample)).toContain('1,000 iNaturalist observations');
    expect(exploreSpeciesMeta(sample)).toContain('+5 bonus points');
  });
});
