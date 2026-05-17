import { describe, expect, it } from 'vitest';

import type { ExploreSpecies } from '@/lib/explore/exploreSpeciesTypes';
import { organizeExploreSpeciesList, sortExploreSpecies } from '@/lib/explore/exploreSpeciesSort';

function species(overrides: Partial<ExploreSpecies>): ExploreSpecies {
  return {
    id: 'id',
    inaturalistId: 1,
    latinName: 'Species latin',
    commonName: 'Species',
    type: 'animals',
    iconicTaxonName: null,
    observationsCount: 0,
    rank: 0,
    state: 'Florida',
    wikipediaUrl: null,
    imageUrl: null,
    wikiSummary: null,
    wikiImageUrl: null,
    isFeatured: false,
    bonusPoints: 0,
    ...overrides,
  };
}

describe('sortExploreSpecies', () => {
  it('sorts by rank, observations, and name', () => {
    const items = [
      species({ id: 'a', commonName: 'Zebra', rank: 3, observationsCount: 10 }),
      species({ id: 'b', commonName: 'Ant', rank: 1, observationsCount: 100 }),
      species({ id: 'c', commonName: 'Bear', rank: 2, observationsCount: 50 }),
    ];
    expect(sortExploreSpecies(items, 'rank').map((s) => s.id)).toEqual(['b', 'c', 'a']);
    expect(sortExploreSpecies(items, 'observations').map((s) => s.id)).toEqual(['b', 'c', 'a']);
    expect(sortExploreSpecies(items, 'name').map((s) => s.id)).toEqual(['b', 'c', 'a']);
  });
});

describe('organizeExploreSpeciesList', () => {
  it('splits featured from rest and sorts each group', () => {
    const items = [
      species({ id: 'f2', isFeatured: true, rank: 2, commonName: 'Featured B' }),
      species({ id: 'r1', isFeatured: false, rank: 1, commonName: 'Regular A' }),
      species({ id: 'f1', isFeatured: true, rank: 1, commonName: 'Featured A' }),
    ];
    const { featured, rest } = organizeExploreSpeciesList(items, 'rank');
    expect(featured.map((s) => s.id)).toEqual(['f1', 'f2']);
    expect(rest.map((s) => s.id)).toEqual(['r1']);
  });
});
