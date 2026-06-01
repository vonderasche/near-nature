import { describe, expect, it } from 'vitest';

import { mergeIdentificationSpecies } from '@/lib/identification/mergeIdentificationSpecies';
import type { ClassificationResult, Species } from '@/types';

const classifications: ClassificationResult[] = [
  {
    latinName: 'Anolis',
    commonName: 'Anolis',
    confidence: 0.9,
    taxonGroup: 'animals',
  },
  {
    latinName: 'Basiliscus',
    commonName: 'Basiliscus',
    confidence: 0.7,
    taxonGroup: 'animals',
  },
];

describe('mergeIdentificationSpecies', () => {
  it('keeps enriched top row and fills alternates from placeholders', () => {
    const baseId = 1000;
    const enriched: Species[] = [
      {
        id: '1000-0',
        latinName: 'Anolis',
        commonName: 'Green anole',
        taxonGroup: 'Lizards',
        status: 'native',
      },
    ];

    const merged = mergeIdentificationSpecies(classifications, enriched, {}, baseId);

    expect(merged).toHaveLength(2);
    expect(merged[0].commonName).toBe('Green anole');
    expect(merged[1].id).toBe('1000-1');
    expect(merged[1].status).toBe('unknown');
    expect(merged[1].latinName).toBe('Basiliscus');
  });

  it('prefers speciesByIndex over placeholders', () => {
    const baseId = 2000;
    const enriched: Species[] = [
      {
        id: '2000-0',
        latinName: 'Anolis',
        commonName: 'Anolis',
        taxonGroup: 'Lizards',
        status: 'native',
      },
    ];
    const speciesByIndex: Record<number, Species> = {
      1: {
        id: '2000-1',
        latinName: 'Basiliscus',
        commonName: 'Basilisk',
        taxonGroup: 'Lizards',
        status: 'non-native',
      },
    };

    const merged = mergeIdentificationSpecies(classifications, enriched, speciesByIndex, baseId);
    expect(merged[1].commonName).toBe('Basilisk');
    expect(merged[1].status).toBe('non-native');
  });
});
