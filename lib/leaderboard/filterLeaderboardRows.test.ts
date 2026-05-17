import { describe, expect, it } from 'vitest';

import { filterLeaderboardRows } from '@/lib/leaderboard/filterLeaderboardRows';
import type { DetectionLeaderboardRow } from '@/lib/leaderboard/detectionCountLeaderboardMap';

function row(overrides: Partial<DetectionLeaderboardRow>): DetectionLeaderboardRow {
  return {
    rank: 1,
    userId: 'u1',
    username: 'nature_fan',
    avatarUrl: null,
    motto: 'Watching wildlife',
    pointsTotal: 10,
    recentDetectionImageUrls: [],
    nativeSpeciesCount: 2,
    nonNativeSpeciesCount: 1,
    ...overrides,
  };
}

describe('filterLeaderboardRows', () => {
  const rows = [
    row({ userId: 'u1', username: 'nature_fan', motto: 'Watching wildlife' }),
    row({ userId: 'u2', username: 'plant_lover', motto: 'Botany every day' }),
  ];

  it('matches username', () => {
    expect(filterLeaderboardRows(rows, 'plant').map((r) => r.userId)).toEqual(['u2']);
  });

  it('matches motto text', () => {
    expect(filterLeaderboardRows(rows, 'botany').map((r) => r.userId)).toEqual(['u2']);
  });
});
