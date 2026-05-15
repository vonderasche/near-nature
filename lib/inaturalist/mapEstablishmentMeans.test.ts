import { describe, expect, it } from 'vitest';

import {
  mapEstablishmentMeansToSpeciesStatus,
  pickUsStatePlaceId,
} from '@/lib/inaturalist/mapEstablishmentMeans';

describe('mapEstablishmentMeansToSpeciesStatus', () => {
  it('maps native and endemic', () => {
    expect(mapEstablishmentMeansToSpeciesStatus('native')).toBe('native');
    expect(mapEstablishmentMeansToSpeciesStatus('endemic')).toBe('native');
  });

  it('maps introduced taxa as non-native', () => {
    expect(mapEstablishmentMeansToSpeciesStatus('introduced')).toBe('non-native');
  });

  it('returns unknown when means are missing', () => {
    expect(mapEstablishmentMeansToSpeciesStatus(null)).toBe('unknown');
    expect(mapEstablishmentMeansToSpeciesStatus('')).toBe('unknown');
  });
});

describe('pickUsStatePlaceId', () => {
  it('prefers exact US state name over partial matches', () => {
    const id = pickUsStatePlaceId(
      [
        { id: 33, name: 'West Virginia', display_name: 'West Virginia, US' },
        { id: 7, name: 'Virginia', display_name: 'Virginia, US' },
      ],
      'Virginia',
    );
    expect(id).toBe(7);
  });

  it('picks Florida US over other Floridas', () => {
    const id = pickUsStatePlaceId(
      [
        { id: 7539, name: 'Florida', display_name: 'Florida, PR' },
        { id: 21, name: 'Florida', display_name: 'Florida, US' },
      ],
      'Florida',
    );
    expect(id).toBe(21);
  });
});
