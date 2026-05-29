import { describe, expect, it } from 'vitest';

import { speciesRecordFromRow, speciesRecordToRow } from '@/lib/db/speciesRecordRow';

describe('speciesRecordRow', () => {
  it('round-trips record fields through SQLite row shape', () => {
    const record = {
      id: 'Asclepias',
      scientificName: 'Asclepias',
      commonName: 'Milkweeds',
      group: 'Wildflower',
      floridaStatus: 'unknown',
      taxonomy: { family: 'Apocynaceae', genus: 'Asclepias' },
      description: 'Genus of milkweeds.',
      identificationTraits: [] as string[],
      interestingFacts: ['Monarch host plants'],
      sourceUrls: { wikipedia: 'https://en.wikipedia.org/wiki/Asclepias' },
      updatedAt: '2026-05-29',
    };

    const row = speciesRecordToRow(record);
    const restored = speciesRecordFromRow(row);
    expect(restored).toEqual(record);
  });
});
