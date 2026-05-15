import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ClassificationResult } from '@/types';

vi.mock('@/lib/devLog', () => ({
  devLog: vi.fn(),
}));

vi.mock('@/api/inaturalist', () => ({
  lookupNativeStatus: vi.fn(),
}));

vi.mock('@/api/wikipedia', () => ({
  fetchSpeciesWikiData: vi.fn(),
}));

import { lookupNativeStatus } from '@/api/inaturalist';
import { fetchSpeciesWikiData } from '@/api/wikipedia';

import { enrichSpeciesFromApis } from './enrichSpeciesFromApis';

const classification: ClassificationResult = {
  latinName: 'Danaus plexippus',
  commonName: 'Monarch butterfly',
  confidence: 0.9,
  taxonGroup: 'animals',
};

describe('enrichSpeciesFromApis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(lookupNativeStatus).mockResolvedValue({
      status: 'native',
      taxonId: 1,
      establishmentMeans: 'native',
    });
    vi.mocked(fetchSpeciesWikiData).mockResolvedValue({
      description: 'A butterfly.',
      fullDescription: 'A butterfly with orange wings.',
      imageUrl: null,
      funFacts: [],
      pageUrl: 'https://en.wikipedia.org/wiki/Monarch',
    });
  });

  it('calls iNaturalist and Wikipedia in parallel per species', async () => {
    const order: string[] = [];
    vi.mocked(lookupNativeStatus).mockImplementation(async () => {
      order.push('inat-start');
      await new Promise((r) => setTimeout(r, 10));
      order.push('inat-end');
      return { status: 'native', taxonId: 1, establishmentMeans: 'native' };
    });
    vi.mocked(fetchSpeciesWikiData).mockImplementation(async (name) => {
      order.push(`wiki-${name}`);
      return null;
    });

    await enrichSpeciesFromApis([classification], 'VA', 3);

    expect(lookupNativeStatus).toHaveBeenCalledWith('Danaus plexippus', 'VA');
    expect(fetchSpeciesWikiData).toHaveBeenCalledWith('Danaus plexippus');
    expect(fetchSpeciesWikiData).toHaveBeenCalledWith('Monarch butterfly');
    expect(order.indexOf('inat-start')).toBeLessThan(order.indexOf('inat-end'));
    expect(order.filter((e) => e.startsWith('wiki-')).length).toBe(2);
  });

  it('only fetches wiki for the first N species', async () => {
    const second: ClassificationResult = {
      ...classification,
      latinName: 'Apis mellifera',
      commonName: 'Honey bee',
    };

    await enrichSpeciesFromApis([classification, second], 'FL', 1);

    expect(fetchSpeciesWikiData).toHaveBeenCalledTimes(2);
    expect(fetchSpeciesWikiData).not.toHaveBeenCalledWith('Apis mellifera');
  });

  it('returns combined species and wiki map', async () => {
    const result = await enrichSpeciesFromApis([classification], 'VA');

    expect(result.species).toHaveLength(1);
    expect(result.species[0].status).toBe('native');
    expect(result.wikiByLatinName['Danaus plexippus']?.description).toBe('A butterfly.');
    expect(result.wikiError).toBeNull();
  });
});
