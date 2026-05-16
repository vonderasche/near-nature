import { describe, expect, it } from 'vitest';

import { collectLeaderboardImageStoredUrls } from '@/lib/leaderboard/collectLeaderboardImageStoredUrls';
import type { DetectionLeaderboardRow } from '@/lib/leaderboard/detectionCountLeaderboardMap';

function row(overrides: Partial<DetectionLeaderboardRow>): DetectionLeaderboardRow {
  return {
    rank: 1,
    userId: 'user-a',
    username: 'a',
    avatarUrl: null,
    motto: null,
    pointsTotal: 0,
    recentDetectionImageUrls: [],
    nativeSpeciesCount: 0,
    nonNativeSpeciesCount: 0,
    ...overrides,
  };
}

describe('collectLeaderboardImageStoredUrls', () => {
  it('collects unique avatars and preview URLs across rows', () => {
    const shared = 'https://x.co/storage/v1/object/public/detections/u1/a.jpg';
    const urls = collectLeaderboardImageStoredUrls([
      row({
        avatarUrl: shared,
        recentDetectionImageUrls: [shared, 'https://x.co/storage/v1/object/public/detections/u1/b.jpg'],
      }),
      row({
        userId: 'user-b',
        avatarUrl: 'https://x.co/storage/v1/object/public/detections/u2/c.jpg',
        recentDetectionImageUrls: ['https://x.co/storage/v1/object/public/detections/u1/b.jpg'],
      }),
    ]);

    expect(urls).toEqual([
      shared,
      'https://x.co/storage/v1/object/public/detections/u1/b.jpg',
      'https://x.co/storage/v1/object/public/detections/u2/c.jpg',
    ]);
  });
});
