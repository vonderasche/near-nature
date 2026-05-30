import { describe, expect, it } from 'vitest';

import { EXPLORER_BOARD_LIST_CACHE_VERSION } from '@/constants/explorer-board-cache';
import { parseCachedExplorerBoardList } from '@/lib/explorerBoard/explorerBoardListCacheParse';

describe('parseCachedExplorerBoardList', () => {
  it('parses a valid envelope', () => {
    const parsed = parseCachedExplorerBoardList(
      JSON.stringify({
        v: EXPLORER_BOARD_LIST_CACHE_VERSION,
        rows: [
          {
            rank: 1,
            userId: 'user-1',
            username: 'nature_fan',
            avatarUrl: null,
            motto: 'Hello',
            pointsTotal: 10,
            recentDetectionImageUrls: [],
            nativeSpeciesCount: 3,
            nonNativeSpeciesCount: 1,
          },
        ],
        hasMore: true,
        cachedAt: 1,
      }),
    );

    expect(parsed?.rows).toHaveLength(1);
    expect(parsed?.hasMore).toBe(true);
  });

  it('rejects wrong version', () => {
    expect(
      parseCachedExplorerBoardList(
        JSON.stringify({
          v: EXPLORER_BOARD_LIST_CACHE_VERSION + 1,
          rows: [],
          hasMore: false,
          cachedAt: 1,
        }),
      ),
    ).toBeNull();
  });
});
