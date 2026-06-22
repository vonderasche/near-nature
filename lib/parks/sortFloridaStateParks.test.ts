import { describe, expect, it } from 'vitest';

import { sortFloridaStateParks } from '@/lib/parks/sortFloridaStateParks';
import type { FloridaStatePark } from '@/types/florida-state-park';

function park(overrides: Partial<FloridaStatePark>): FloridaStatePark {
  return {
    parkId: 'test-park',
    unitId: 'S00001',
    parkName: 'Test Park',
    webAlias: 'test-park',
    county: 'Test',
    district: 1,
    acreage: 100,
    address: '',
    city: 'Test City',
    state: 'FL',
    latitude: 28,
    longitude: -82,
    gpsSource: 'Main Entrance',
    hasGps: true,
    parkPageUrl: '',
    imageUrl: '',
    imageSource: '',
    imageLicense: '',
    imageAttribution: '',
    description: '',
    topPlants: [],
    topAnimals: [],
    publicAccess: 'Open-No Fee Required',
    dataSource: 'test',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

describe('sortFloridaStateParks', () => {
  const sample = [
    park({ parkId: 'b', parkName: 'Beta Park', acreage: 50, publicAccess: 'Open-Fee Required' }),
    park({ parkId: 'a', parkName: 'Alpha Park', acreage: 500, publicAccess: 'Open-No Fee Required' }),
    park({
      parkId: 'c',
      parkName: 'Charlie Park',
      acreage: 200,
      publicAccess: 'Open-Fee Required',
      latitude: 30.5,
      longitude: -84.2,
    }),
  ];

  it('sorts alphabetically by park name', () => {
    const sorted = sortFloridaStateParks(sample, 'name');
    expect(sorted.map((item) => item.parkName)).toEqual([
      'Alpha Park',
      'Beta Park',
      'Charlie Park',
    ]);
  });

  it('sorts by acreage descending', () => {
    const sorted = sortFloridaStateParks(sample, 'acreage');
    expect(sorted.map((item) => item.parkName)).toEqual([
      'Alpha Park',
      'Charlie Park',
      'Beta Park',
    ]);
  });

  it('sorts free-access parks before fee parks', () => {
    const sorted = sortFloridaStateParks(sample, 'free');
    expect(sorted[0]?.parkName).toBe('Alpha Park');
    expect(sorted.slice(1).every((item) => item.publicAccess.includes('Fee Required'))).toBe(true);
  });

  it('sorts by distance when coordinates are available', () => {
    const sorted = sortFloridaStateParks(sample, 'nearest', {
      latitude: 30.4,
      longitude: -84.1,
    });
    expect(sorted[0]?.parkName).toBe('Charlie Park');
  });

  it('falls back to name sort for nearest when coordinates are missing', () => {
    const sorted = sortFloridaStateParks(sample, 'nearest', null);
    expect(sorted.map((item) => item.parkName)).toEqual([
      'Alpha Park',
      'Beta Park',
      'Charlie Park',
    ]);
  });
});
