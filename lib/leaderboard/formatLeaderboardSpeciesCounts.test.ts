import { describe, expect, it } from 'vitest';

import {
  formatLeaderboardSpeciesMeta,
  formatNativeSpeciesCount,
  formatNonNativeSpeciesCount,
  formatPointsTotal,
} from '@/lib/leaderboard/formatLeaderboardSpeciesCounts';

describe('formatLeaderboardSpeciesCounts', () => {
  it('formats points, native, and non-native counts', () => {
    expect(formatPointsTotal(1)).toBe('1 point');
    expect(formatPointsTotal(120)).toBe('120 points');
    expect(formatNativeSpeciesCount(1)).toBe('1 native species');
    expect(formatNonNativeSpeciesCount(3)).toBe('3 non-native species');
    expect(
      formatLeaderboardSpeciesMeta({
        pointsTotal: 80,
        nativeSpeciesCount: 5,
        nonNativeSpeciesCount: 2,
      }),
    ).toBe('80 points · 5 native species · 2 non-native species');
  });
});
