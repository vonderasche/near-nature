import { describe, expect, it } from 'vitest';

import {
  latestLeaderboardGalleryImageUrl,
  leaderboardMemberTileImageUrl,
} from '@/lib/explorerBoard/latestLeaderboardGalleryImage';

describe('latestLeaderboardGalleryImageUrl', () => {
  it('returns the first recent URL', () => {
    expect(
      latestLeaderboardGalleryImageUrl({
        recentDetectionImageUrls: ['https://a.jpg', 'https://b.jpg'],
      }),
    ).toBe('https://a.jpg');
  });

  it('falls back to avatar when gallery is empty', () => {
    expect(
      leaderboardMemberTileImageUrl({
        recentDetectionImageUrls: [],
        avatarUrl: 'https://avatar.jpg',
      }),
    ).toBe('https://avatar.jpg');
  });
});
