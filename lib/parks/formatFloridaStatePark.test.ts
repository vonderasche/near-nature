import { describe, expect, it } from 'vitest';

import {
  formatDistanceMiles,
  formatParkMeta,
  parkDistanceMiles,
} from '@/lib/parks/formatFloridaStatePark';
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
    description: '',
    topPlants: [],
    topAnimals: [],
    publicAccess: 'Open-No Fee Required',
    dataSource: 'test',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

describe('formatDistanceMiles', () => {
  it('formats short distances with one decimal', () => {
    expect(formatDistanceMiles(2.34)).toBe('2.3 mi');
  });

  it('formats long distances as whole miles', () => {
    expect(formatDistanceMiles(128.6)).toBe('129 mi');
  });
});

describe('formatParkMeta distance', () => {
  it('prepends distance when provided', () => {
    const meta = formatParkMeta(park({}), { distanceMiles: 2.4 });
    expect(meta.startsWith('2.4 mi · ')).toBe(true);
  });

  it('computes park distance from device coordinates', () => {
    const miles = parkDistanceMiles(park({ latitude: 30.5, longitude: -84.3 }), {
      latitude: 30.44,
      longitude: -84.28,
    });
    expect(miles).not.toBeNull();
    expect(miles!).toBeGreaterThan(0);
  });
});
