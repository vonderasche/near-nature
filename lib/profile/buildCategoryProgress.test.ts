import { describe, expect, it } from 'vitest';

import { buildMainCategoryProgress } from '@/lib/profile/buildCategoryProgress';
import { TIER_SPECIES_THRESHOLDS } from '@/constants/naturalist-categories';

describe('buildMainCategoryProgress', () => {
  it('maps server sub/main counts into discipline progress', () => {
    const mains = buildMainCategoryProgress(
      [{ id: 'songbirds', speciesCount: 12 }],
      [{ id: 'ornithologist', speciesCount: 12 }],
    );

    const ornithologist = mains.find((m) => m.id === 'ornithologist');
    expect(ornithologist?.speciesCount).toBe(12);

    const expectedTier =
      12 >= TIER_SPECIES_THRESHOLDS.voyager
        ? 'voyager'
        : 12 >= TIER_SPECIES_THRESHOLDS.adventurer
          ? 'adventurer'
          : 'explorer';
    expect(ornithologist?.tier).toBe(expectedTier);

    const songbirds = ornithologist?.subcategories.find((s) => s.id === 'songbirds');
    expect(songbirds?.speciesCount).toBe(12);
    expect(songbirds?.tier).toBe(expectedTier);
  });

  it('returns null tier when species count is zero', () => {
    const mains = buildMainCategoryProgress(
      [{ id: 'songbirds', speciesCount: 0 }],
      [{ id: 'ornithologist', speciesCount: 0 }],
    );
    const ornithologist = mains.find((m) => m.id === 'ornithologist');
    expect(ornithologist?.tier).toBeNull();
  });
});
