import { describe, expect, it } from 'vitest';

import {
  resolveParkListImageUrl,
  speciesHighlightNames,
  zipSpeciesHighlights,
} from '@/lib/parks/parkSpeciesHighlights';
import type { FloridaStatePark } from '@/types/florida-state-park';

function park(overrides: Partial<FloridaStatePark>): FloridaStatePark {
  return {
    parkId: 'test',
    unitId: 'S00001',
    parkName: 'Test Park',
    webAlias: 'test',
    county: 'Leon',
    district: 1,
    acreage: 100,
    address: '',
    city: 'Tallahassee',
    state: 'FL',
    latitude: 30.44,
    longitude: -84.28,
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

describe('zipSpeciesHighlights', () => {
  it('pairs names with image urls by index', () => {
    expect(
      zipSpeciesHighlights(['Oak', 'Pine'], ['https://example.com/oak.jpg', 'https://example.com/pine.jpg']),
    ).toEqual([
      { name: 'Oak', imageUrl: 'https://example.com/oak.jpg' },
      { name: 'Pine', imageUrl: 'https://example.com/pine.jpg' },
    ]);
  });
});

describe('resolveParkListImageUrl', () => {
  it('prefers park hero image', () => {
    expect(
      resolveParkListImageUrl(
        park({
          imageUrl: 'https://example.com/park.jpg',
          topAnimals: [{ name: 'Crane', imageUrl: 'https://example.com/crane.jpg' }],
        }),
      ),
    ).toBe('https://example.com/park.jpg');
  });

  it('falls back to featured species images', () => {
    expect(
      resolveParkListImageUrl(
        park({
          topAnimals: [{ name: 'Crane', imageUrl: 'https://example.com/crane.jpg' }],
        }),
      ),
    ).toBe('https://example.com/crane.jpg');
  });
});

describe('speciesHighlightNames', () => {
  it('extracts display names', () => {
    expect(
      speciesHighlightNames([
        { name: 'Oak', imageUrl: '' },
        { name: 'Pine', imageUrl: 'https://example.com/pine.jpg' },
      ]),
    ).toEqual(['Oak', 'Pine']);
  });
});
