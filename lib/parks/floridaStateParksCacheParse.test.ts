import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { FLORIDA_PARKS_CACHE_VERSION } from '@/constants/florida-parks-cache';
import { parseFloridaStateParksCsv } from '@/lib/parks/parseFloridaStateParksCsv';
import { parseCachedFloridaStateParks } from '@/lib/parks/floridaStateParksCacheParse';

const csvPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../assets/data/florida_state_parks.csv',
);

describe('parseCachedFloridaStateParks', () => {
  it('round-trips parsed parks through cache JSON', () => {
    const parks = parseFloridaStateParksCsv(readFileSync(csvPath, 'utf8'));
    const json = JSON.stringify({ v: FLORIDA_PARKS_CACHE_VERSION, parks, cachedAt: Date.now() });
    const cached = parseCachedFloridaStateParks(json);
    expect(cached?.parks.length).toBe(parks.length);
    expect(cached?.parks[0]?.parkName).toBe(parks[0]?.parkName);
  });

  it('rejects invalid cache payloads', () => {
    expect(parseCachedFloridaStateParks(null)).toBeNull();
    expect(parseCachedFloridaStateParks('{}')).toBeNull();
    expect(parseCachedFloridaStateParks(JSON.stringify({ v: 99, parks: [], cachedAt: 0 }))).toBeNull();
  });
});
