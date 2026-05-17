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
  it('collects latest gallery, avatar, and dedupes per row', () => {
    const latest = 'https://x.co/storage/v1/object/public/detections/u1/b.jpg';
    const avatar = 'https://x.co/storage/v1/object/public/detections/u1/a.jpg';
    const urls = collectLeaderboardImageStoredUrls([
      row({
        avatarUrl: avatar,
        recentDetectionImageUrls: [latest, 'https://x.co/storage/v1/object/public/detections/u1/old.jpg'],
      }),
      row({
        userId: 'user-b',
        avatarUrl: 'https://x.co/storage/v1/object/public/detections/u2/c.jpg',
        recentDetectionImageUrls: [],
      }),
    ]);

    expect(urls).toEqual([latest, avatar, 'https://x.co/storage/v1/object/public/detections/u2/c.jpg']);
  });
});
