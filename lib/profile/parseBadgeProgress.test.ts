import { describe, expect, it } from 'vitest';

import { parseBadgeProgressRow } from '@/lib/profile/parseBadgeProgress';

describe('parseBadgeProgressRow', () => {
  it('maps snake_case RPC fields to badge progress', () => {
    const progress = parseBadgeProgressRow({
      award_key: 'sub:wildflowers:explorer',
      badge_kind: 'sub',
      main_category: 'botanist',
      subcategory: 'wildflowers',
      tier: 'explorer',
      label: 'Wildflowers Explorer',
      points: 25,
      unique_species_count: 2,
      required_unique_species: 3,
      earned: false,
    });

    expect(progress).toEqual({
      awardKey: 'sub:wildflowers:explorer',
      badgeKind: 'sub',
      mainCategory: 'botanist',
      subcategory: 'wildflowers',
      tier: 'explorer',
      label: 'Wildflowers Explorer',
      points: 25,
      uniqueSpeciesCount: 2,
      requiredUniqueSpecies: 3,
      earned: false,
    });
  });

  it('supports a default earned state for legacy public award rows', () => {
    const progress = parseBadgeProgressRow(
      {
        award_key: 'badge:ends_of_the_earth',
        badge_kind: 'bonus',
        label: 'Ends of the Earth',
        points: 1000,
      },
      { defaultEarned: true },
    );

    expect(progress.earned).toBe(true);
  });
});
