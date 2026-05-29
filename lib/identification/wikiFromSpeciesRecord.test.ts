import { describe, expect, it } from 'vitest';

import { wikiFromSpeciesRecord } from '@/lib/identification/wikiFromSpeciesRecord';

describe('wikiFromSpeciesRecord', () => {
  it('returns null when description is empty', () => {
    expect(
      wikiFromSpeciesRecord({
        id: '1',
        scientificName: 'Asclepias tuberosa',
        commonName: 'Butterfly milkweed',
        group: 'Flowering Plant',
        floridaStatus: 'native',
        taxonomy: {},
        description: '   ',
        identificationTraits: [],
        interestingFacts: [],
        sourceUrls: {},
        updatedAt: '2026-05-25',
      }),
    ).toBeNull();
  });

  it('prefers interesting facts for funFacts when present', () => {
    const wiki = wikiFromSpeciesRecord({
      id: '1',
      scientificName: 'Asclepias tuberosa',
      commonName: 'Butterfly milkweed',
      group: 'Flowering Plant',
      floridaStatus: 'native',
      taxonomy: {},
      description: 'Orange flowers.',
      identificationTraits: ['narrow leaves'],
      interestingFacts: ['Monarch host'],
      sourceUrls: { wikipedia: 'https://en.wikipedia.org/wiki/Asclepias_tuberosa' },
      updatedAt: '2026-05-25',
    });

    expect(wiki?.funFacts).toEqual(['Monarch host']);
    expect(wiki?.pageUrl).toBe('https://en.wikipedia.org/wiki/Asclepias_tuberosa');
  });
});
