import { describe, expect, it } from 'vitest';

import { filterExploreSpecies } from '@/lib/explore/filterExploreSpecies';
import type { ExploreSpecies } from '@/lib/explore/exploreSpeciesTypes';

function species(overrides: Partial<ExploreSpecies>): ExploreSpecies {
  return {
    id: '1',
    inaturalistId: 1,
    latinName: 'Panthera leo',
    commonName: 'Lion',
    type: 'animals',
    iconicTaxonName: 'Mammalia',
    observationsCount: 100,
    rank: 1,
    state: 'Florida',
    wikipediaUrl: null,
    imageUrl: null,
    wikiSummary: 'A large cat native to Africa.',
    wikiImageUrl: null,
    isFeatured: false,
    bonusPoints: 0,
    ...overrides,
  };
}

describe('filterExploreSpecies', () => {
  const items = [
    species({ id: 'a', commonName: 'Lion', latinName: 'Panthera leo' }),
    species({ id: 'b', commonName: 'Oak', latinName: 'Quercus', type: 'plants', wikiSummary: 'A tree' }),
  ];

  it('returns all when query is empty', () => {
    expect(filterExploreSpecies(items, '')).toHaveLength(2);
  });

  it('matches common and scientific names', () => {
    expect(filterExploreSpecies(items, 'panthera').map((s) => s.id)).toEqual(['a']);
    expect(filterExploreSpecies(items, 'quercus').map((s) => s.id)).toEqual(['b']);
  });

  it('matches wiki summary text', () => {
    expect(filterExploreSpecies(items, 'large cat').map((s) => s.id)).toEqual(['a']);
    expect(filterExploreSpecies(items, 'tree').map((s) => s.id)).toEqual(['b']);
  });
});
