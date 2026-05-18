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

vi.mock('@/lib/identification/savedSpeciesSessionCache', () => ({
  resolveSavedSpeciesForLatinNames: vi.fn(),
}));

import { lookupNativeStatus } from '@/api/inaturalist';
import { fetchSpeciesWikiData } from '@/api/wikipedia';
import { resolveSavedSpeciesForLatinNames } from '@/lib/identification/savedSpeciesSessionCache';

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
    vi.mocked(resolveSavedSpeciesForLatinNames).mockResolvedValue(new Map());
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

    await enrichSpeciesFromApis([classification], 'VA', { wikiSpeciesLimit: 3 });

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

    await enrichSpeciesFromApis([classification, second], 'FL', { wikiSpeciesLimit: 1 });

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

  it('reuses saved detection and skips external APIs when data exists', async () => {
    vi.mocked(resolveSavedSpeciesForLatinNames).mockResolvedValue(
      new Map([
        [
          'danaus plexippus',
          {
            latinName: 'Danaus plexippus',
            commonName: 'Monarch butterfly',
            status: 'native',
            description: 'Saved from your last sighting.',
            inaturalistId: '123',
          },
        ],
      ]),
    );

    const result = await enrichSpeciesFromApis([classification], 'VA', {
      userId: 'user-1',
      wikiSpeciesLimit: 3,
    });

    expect(lookupNativeStatus).not.toHaveBeenCalled();
    expect(fetchSpeciesWikiData).not.toHaveBeenCalled();
    expect(result.species[0].status).toBe('native');
    expect(result.wikiByLatinName['Danaus plexippus']?.description).toBe(
      'Saved from your last sighting.',
    );
  });

  it('does not call iNat for alternate classifications', async () => {
    const second: ClassificationResult = {
      ...classification,
      latinName: 'Apis mellifera',
      commonName: 'Honey bee',
    };

    const result = await enrichSpeciesFromApis([classification, second], 'FL');

    expect(lookupNativeStatus).toHaveBeenCalledTimes(1);
    expect(lookupNativeStatus).toHaveBeenCalledWith('Danaus plexippus', 'FL');
    expect(result.species[1].status).toBe('unknown');
  });

  it('still calls iNat when saved native status is unknown', async () => {
    vi.mocked(resolveSavedSpeciesForLatinNames).mockResolvedValue(
      new Map([
        [
          'danaus plexippus',
          {
            latinName: 'Danaus plexippus',
            commonName: 'Monarch',
            status: 'unknown',
            description: 'Prior note only.',
            inaturalistId: null,
          },
        ],
      ]),
    );

    await enrichSpeciesFromApis([classification], 'VA', { userId: 'user-1' });

    expect(lookupNativeStatus).toHaveBeenCalled();
    expect(fetchSpeciesWikiData).not.toHaveBeenCalled();
  });
});
