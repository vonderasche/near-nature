import { describe, expect, it } from 'vitest';

import { filterExploreSpeciesByTaxon } from '@/lib/explore/exploreSpeciesTaxonFilter';
import type { ExploreSpecies } from '@/lib/explore/exploreSpeciesTypes';

function species(iconic: string): ExploreSpecies {
  return {
    id: '1',
    inaturalistId: 1,
    latinName: 'X',
    commonName: 'X',
    type: 'animals',
    iconicTaxonName: iconic,
    observationsCount: 1,
    rank: 1,
    state: 'Florida',
    wikipediaUrl: null,
    imageUrl: null,
    wikiSummary: null,
    wikiImageUrl: null,
    isFeatured: false,
    bonusPoints: 0,
  };
}

describe('filterExploreSpeciesByTaxon', () => {
  const items = [species('Aves'), species('Mammalia'), species('Reptilia')];

  it('filters birds', () => {
    expect(filterExploreSpeciesByTaxon(items, 'birds')).toHaveLength(1);
  });
});
