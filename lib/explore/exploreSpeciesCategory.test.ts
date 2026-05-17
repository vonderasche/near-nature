import { describe, expect, it } from 'vitest';

import type { ExploreSpecies } from '@/lib/explore/exploreSpeciesTypes';
import {
  exploreSpeciesItemsForCategory,
  exploreSpeciesSortForCategory,
  mergeExploreSpeciesByType,
  parseExploreSpeciesCategory,
} from '@/lib/explore/exploreSpeciesCategory';

function species(id: string, type: 'animals' | 'plants', observationsCount: number): ExploreSpecies {
  return {
    id,
    inaturalistId: 1,
    latinName: 'Latin',
    commonName: id,
    type,
    iconicTaxonName: null,
    observationsCount,
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

describe('parseExploreSpeciesCategory', () => {
  it('parses all, animals, and plants', () => {
    expect(parseExploreSpeciesCategory('all')).toBe('all');
    expect(parseExploreSpeciesCategory('plants')).toBe('plants');
    expect(parseExploreSpeciesCategory('animals')).toBe('animals');
    expect(parseExploreSpeciesCategory(null)).toBe('animals');
  });
});

describe('mergeExploreSpeciesByType', () => {
  it('concatenates animals and plants', () => {
    const byType = {
      animals: [species('a1', 'animals', 10)],
      plants: [species('p1', 'plants', 20)],
    };
    expect(mergeExploreSpeciesByType(byType).map((s) => s.id)).toEqual(['a1', 'p1']);
  });
});

describe('exploreSpeciesItemsForCategory', () => {
  it('returns merged list for all', () => {
    const byType = {
      animals: [species('a1', 'animals', 10)],
      plants: [species('p1', 'plants', 20)],
    };
    expect(exploreSpeciesItemsForCategory(byType, 'all')).toHaveLength(2);
    expect(exploreSpeciesItemsForCategory(byType, 'animals')).toHaveLength(1);
  });
});

describe('exploreSpeciesSortForCategory', () => {
  it('forces observations when category is all', () => {
    expect(exploreSpeciesSortForCategory('all', 'rank')).toBe('observations');
    expect(exploreSpeciesSortForCategory('animals', 'rank')).toBe('rank');
  });
});
