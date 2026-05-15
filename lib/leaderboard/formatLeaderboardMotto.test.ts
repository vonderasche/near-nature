import { describe, expect, it } from 'vitest';

import { parseLeaderboardMotto } from '@/lib/leaderboard/formatLeaderboardMotto';

describe('parseLeaderboardMotto', () => {
  it('returns trimmed motto', () => {
    expect(parseLeaderboardMotto('  Leave no trace.  ')).toBe('Leave no trace.');
  });

  it('returns null for empty or whitespace', () => {
    expect(parseLeaderboardMotto('')).toBeNull();
    expect(parseLeaderboardMotto('   ')).toBeNull();
    expect(parseLeaderboardMotto(null)).toBeNull();
    expect(parseLeaderboardMotto(undefined)).toBeNull();
  });
});
