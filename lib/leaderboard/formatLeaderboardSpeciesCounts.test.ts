import { describe, expect, it } from 'vitest';

import {
  formatLeaderboardSpeciesMeta,
  formatNativeSpeciesCount,
  formatNonNativeSpeciesCount,
} from '@/lib/leaderboard/formatLeaderboardSpeciesCounts';

describe('formatLeaderboardSpeciesCounts', () => {
  it('formats native and non-native counts', () => {
    expect(formatNativeSpeciesCount(1)).toBe('1 native species');
    expect(formatNonNativeSpeciesCount(3)).toBe('3 non-native species');
    expect(
      formatLeaderboardSpeciesMeta({ nativeSpeciesCount: 5, nonNativeSpeciesCount: 2 }),
    ).toBe('5 native species · 2 non-native species');
  });
});
