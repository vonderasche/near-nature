import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { parseFloridaStateParksCsv, splitPipeList } from '@/lib/parks/parseFloridaStateParksCsv';
import { floridaStateParkListKey } from '@/lib/parks/formatFloridaStatePark';
import { searchFloridaStateParks } from '@/lib/parks/searchFloridaStateParks';

const csvPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../assets/data/florida_state_parks.csv',
);
const csvText = readFileSync(csvPath, 'utf8');

describe('parseFloridaStateParksCsv', () => {
  it('parses bundled Florida parks CSV with quoted fields', () => {
    const parks = parseFloridaStateParksCsv(csvText);
    expect(parks.length).toBeGreaterThan(150);

    const anclote = parks.find((park) => park.parkId === 'anclote-key');
    expect(anclote).toMatchObject({
      parkName: 'Anclote Key Preserve State Park',
      county: 'Pinellas, Pasco',
      hasGps: true,
      publicAccess: 'Open-Fee Required',
    });
    expect(anclote?.topPlants.length).toBeGreaterThan(0);
    expect(anclote?.topAnimals.length).toBeGreaterThan(0);
  });

  it('sorts parks alphabetically by name', () => {
    const parks = parseFloridaStateParksCsv(csvText);
    const names = parks.map((park) => park.parkName);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })));
  });

  it('assigns unique list keys when park_id is shared across entrances', () => {
    const parks = parseFloridaStateParksCsv(csvText);
    const keys = parks.map((park) => floridaStateParkListKey(park));
    expect(new Set(keys).size).toBe(keys.length);

    const suwannee = parks.filter((park) => park.parkId === 'suwannee-river-wilderness-state-trail');
    expect(suwannee).toHaveLength(2);
    expect(new Set(suwannee.map((park) => floridaStateParkListKey(park))).size).toBe(2);
  });
});

describe('splitPipeList', () => {
  it('splits pipe-delimited species lists', () => {
    expect(splitPipeList('Gopher Tortoise | Pygmy Rattlesnake')).toEqual([
      'Gopher Tortoise',
      'Pygmy Rattlesnake',
    ]);
  });
});

describe('searchFloridaStateParks', () => {
  it('matches parks by county and featured species tokens', () => {
    const parks = parseFloridaStateParksCsv(csvText);
    const monroe = searchFloridaStateParks(parks, 'monroe');
    expect(monroe.some((park) => park.parkId === 'bahia-honda')).toBe(true);

    const manatee = searchFloridaStateParks(parks, 'manatee');
    expect(manatee.some((park) =>
      park.topAnimals.some((item) => item.name.toLowerCase().includes('manatee')),
    )).toBe(true);
  });
});
