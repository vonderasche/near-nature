import { describe, expect, it } from 'vitest';

import { mapParkSpeciesRow } from '@/lib/explore/mapParkSpeciesRow';

describe('mapParkSpeciesRow', () => {
  it('maps get_park_species RPC snake_case row', () => {
    const row = mapParkSpeciesRow({
      latin_name: 'Alligator mississippiensis',
      common_name: 'American Alligator',
      category: 'reptile',
      iconic_taxon_name: 'Reptilia',
      observations_count: 12400,
      is_in_explore: true,
    });
    expect(row).toMatchObject({
      latinName: 'Alligator mississippiensis',
      commonName: 'American Alligator',
      category: 'reptile',
      observationsCount: 12400,
      isInExplore: true,
    });
  });
});
