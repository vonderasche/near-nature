import { describe, expect, it } from 'vitest';

import { aggregateDiscoverSpecies, searchDiscoverSpecies } from '@/lib/parks/aggregateDiscoverSpecies';
import type { FloridaStatePark } from '@/types/florida-state-park';

function park(partial: Partial<FloridaStatePark> & Pick<FloridaStatePark, 'parkName'>): FloridaStatePark {
  return {
    parkId: partial.parkName,
    unitId: 'u',
    parkName: partial.parkName,
    webAlias: '',
    county: 'Alachua',
    district: null,
    acreage: null,
    address: '',
    city: '',
    state: 'FL',
    latitude: null,
    longitude: null,
    gpsSource: '',
    hasGps: false,
    parkPageUrl: '',
    imageUrl: '',
    imageSource: '',
    imageLicense: '',
    imageAttribution: '',
    description: '',
    topPlants: partial.topPlants ?? [],
    topAnimals: partial.topAnimals ?? [],
    publicAccess: '',
    dataSource: '',
    updatedAt: '',
  };
}

describe('aggregateDiscoverSpecies', () => {
  it('merges duplicate species across parks', () => {
    const entries = aggregateDiscoverSpecies(
      [
        park({
          parkName: 'Paynes Prairie',
          topAnimals: [{ name: 'Sandhill Crane', imageUrl: 'https://a.test/crane.jpg' }],
        }),
        park({
          parkName: 'Myakka River',
          topAnimals: [{ name: 'Sandhill Crane', imageUrl: '' }],
        }),
      ],
      'animal',
    );

    expect(entries).toHaveLength(1);
    expect(entries[0]?.parkCount).toBe(2);
    expect(entries[0]?.parkNames).toEqual(['Myakka River', 'Paynes Prairie']);
  });

  it('filters species by name or park', () => {
    const entries = aggregateDiscoverSpecies(
      [
        park({
          parkName: 'Paynes Prairie',
          topPlants: [{ name: 'Saw Palmetto', imageUrl: '' }],
        }),
        park({
          parkName: 'Torreya State Park',
          topPlants: [{ name: 'Florida Torreya', imageUrl: '' }],
        }),
      ],
      'plant',
    );

    expect(searchDiscoverSpecies(entries, 'torreya')).toHaveLength(1);
    expect(searchDiscoverSpecies(entries, 'paynes')).toHaveLength(1);
  });
});
