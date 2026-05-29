import { describe, expect, it } from 'vitest';

import { parseGenusProfiles } from '@/lib/db/parseGenusProfiles';
import type { GenusProfilesJson } from '@/types/speciesRecord';

describe('parseGenusProfiles', () => {
  it('maps genus profile JSON to species records', () => {
    const catalog: GenusProfilesJson = {
      Abaeis: {
        genus: 'Abaeis',
        commonName: 'Grass Yellows',
        familia: 'Pieridae',
        previewGroup: 'Butterfly / Moth',
        description: 'A genus of grass yellow butterflies.',
        funFact: 'Often seen in open fields.',
        nativeRegion: 'native',
        specialistId: 'insects_arachnids',
        inatTaxonId: 51615,
        sourceUrls: {
          inat: 'https://www.inaturalist.org/taxa/51615',
          wikipedia: 'https://en.wikipedia.org/wiki/Eurema',
        },
        wikipediaThumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/x.jpg',
        defaultPhoto: { url: 'https://static.inaturalist.org/photos/1/medium.jpg' },
        updatedAt: '2026-05-29',
      },
      bad: {},
    };

    const records = parseGenusProfiles(catalog);
    expect(records).toHaveLength(1);
    expect(records[0]?.scientificName).toBe('Abaeis');
    expect(records[0]?.taxonomy.family).toBe('Pieridae');
    expect(records[0]?.group).toBe('Butterfly / Moth');
    expect(records[0]?.interestingFacts).toEqual(['Often seen in open fields.']);
    expect(records[0]?.sourceUrls.thumbnail).toContain('wikimedia');
    expect(records[0]?.sourceUrls.defaultPhotoUrl).toContain('inaturalist');
  });
});
