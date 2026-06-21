import { describe, expect, it } from 'vitest';

import { filterDiscoverSpecies, sortDiscoverSpecies } from '@/lib/discover/discoverSpeciesFilter';
import { inferDiscoverSpeciesSubcategory } from '@/lib/discover/inferDiscoverSpeciesSubcategory';
import type { DiscoverSpeciesEntry } from '@/types/discover-species';

function entry(partial: Partial<DiscoverSpeciesEntry> & Pick<DiscoverSpeciesEntry, 'name' | 'kind'>): DiscoverSpeciesEntry {
  return {
    imageUrl: '',
    subcategoryId: partial.subcategoryId ?? inferDiscoverSpeciesSubcategory(partial.name, partial.kind),
    parkCount: partial.parkCount ?? 1,
    parkNames: partial.parkNames ?? ['Test Park'],
    ...partial,
  };
}

describe('inferDiscoverSpeciesSubcategory', () => {
  it('classifies common animal groups', () => {
    expect(inferDiscoverSpeciesSubcategory('Brown Watersnake', 'animal')).toBe('snakes');
    expect(inferDiscoverSpeciesSubcategory('Sandhill Crane', 'animal')).toBe('wading_birds');
    expect(inferDiscoverSpeciesSubcategory('Bluestriped Grunt', 'animal')).toBe('fish');
    expect(inferDiscoverSpeciesSubcategory('Red-femured Spotted Orbweaver', 'animal')).toBe('insects');
  });

  it('classifies common plant groups', () => {
    expect(inferDiscoverSpeciesSubcategory('Saw Palmetto', 'plant')).toBe('trees_shrubs');
    expect(inferDiscoverSpeciesSubcategory('Yellow milkwort', 'plant')).toBe('wildflowers');
    expect(inferDiscoverSpeciesSubcategory('Giant leather fern', 'plant')).toBe('ferns_mosses');
  });
});

describe('discover species filter and sort', () => {
  it('filters by subcategory', () => {
    const entries = [
      entry({ name: 'Brown Watersnake', kind: 'animal', subcategoryId: 'snakes' }),
      entry({ name: 'Sandhill Crane', kind: 'animal', subcategoryId: 'wading_birds' }),
    ];
    const filtered = filterDiscoverSpecies(entries, { kind: 'subcategory', subcategory: 'snakes' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.name).toBe('Brown Watersnake');
  });

  it('sorts by park count', () => {
    const entries = [
      entry({ name: 'Alpha', kind: 'animal', parkCount: 1 }),
      entry({ name: 'Beta', kind: 'animal', parkCount: 3 }),
    ];
    const sorted = sortDiscoverSpecies(entries, 'park_count');
    expect(sorted.map((item) => item.name)).toEqual(['Beta', 'Alpha']);
  });
});
