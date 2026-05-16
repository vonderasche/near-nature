import { describe, expect, it } from 'vitest';

import { mapExploreSpeciesRow } from '@/lib/explore/mapExploreSpeciesRow';

describe('mapExploreSpeciesRow', () => {
  it('maps snake_case row', () => {
    const row = mapExploreSpeciesRow({
      id: 'abc',
      inaturalist_id: 6930,
      latin_name: 'Anas platyrhynchos',
      common_name: 'Mallard',
      type: 'animals',
      iconic_taxon_name: 'Aves',
      observations_count: 887974,
      rank: 1,
      state: 'Florida',
      wikipedia_url: 'http://en.wikipedia.org/wiki/Mallard',
      image_url: 'https://example.com/m.jpg',
      is_featured: false,
      bonus_points: 5,
    });
    expect(row.commonName).toBe('Mallard');
    expect(row.type).toBe('animals');
    expect(row.observationsCount).toBe(887974);
    expect(row.rank).toBe(1);
  });
});
