import { describe, expect, it } from 'vitest';

import {
  explorerBoardMemberTileImageUrl,
  latestExplorerBoardGalleryImageUrl,
} from '@/lib/explorerBoard/latestExplorerBoardGalleryImage';

describe('latestExplorerBoardGalleryImageUrl', () => {
  it('returns the first recent URL', () => {
    expect(
      latestExplorerBoardGalleryImageUrl({
        recentDetectionImageUrls: ['https://a.jpg', 'https://b.jpg'],
      }),
    ).toBe('https://a.jpg');
  });

  it('falls back to avatar when gallery is empty', () => {
    expect(
      explorerBoardMemberTileImageUrl({
        recentDetectionImageUrls: [],
        avatarUrl: 'https://avatar.jpg',
      }),
    ).toBe('https://avatar.jpg');
  });
});
