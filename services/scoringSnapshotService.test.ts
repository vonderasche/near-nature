import { describe, expect, it } from 'vitest';

import { parseUserScoringSnapshotPayload } from '@/lib/profile/parseScoringSnapshotPayload';

describe('parseUserScoringSnapshotPayload', () => {
  it('parses badge progress alongside awards and species counts', () => {
    const snapshot = parseUserScoringSnapshotPayload({
      score_rows: [
        {
          main_category: 'botanist',
          detection_points: 15,
          award_points: 25,
          total_points: 40,
          species_count: 3,
        },
      ],
      awards: [
        {
          award_key: 'sub:wildflowers:explorer',
          points: 25,
          label: 'Wildflowers Explorer',
          awarded_at: '2026-05-25T00:00:00Z',
        },
      ],
      sub_species_counts: [{ subcategory: 'wildflowers', species_count: 3 }],
      main_species_counts: [{ main_category: 'botanist', species_count: 3 }],
      badge_progress: [
        {
          award_key: 'sub:wildflowers:explorer',
          badge_kind: 'sub',
          main_category: 'botanist',
          subcategory: 'wildflowers',
          tier: 'explorer',
          label: 'Wildflowers Explorer',
          points: 25,
          unique_species_count: 3,
          required_unique_species: 3,
          earned: true,
        },
      ],
    });

    expect(snapshot.breakdown.totalPoints).toBe(40);
    expect(snapshot.awardKeys.has('sub:wildflowers:explorer')).toBe(true);
    expect(snapshot.badgeProgress[0]).toMatchObject({
      awardKey: 'sub:wildflowers:explorer',
      uniqueSpeciesCount: 3,
      requiredUniqueSpecies: 3,
      earned: true,
    });
    expect(snapshot.mains.find((main) => main.id === 'botanist')?.speciesCount).toBe(3);
  });

  it('rejects invalid snapshot payloads', () => {
    expect(() => parseUserScoringSnapshotPayload(null)).toThrow(
      'Invalid scoring snapshot response.',
    );
  });
});
