import { describe, expect, it } from 'vitest';

import {
  shouldLoadExplorerBoardFromCache,
  shouldPersistExplorerBoardCache,
} from '@/lib/explorerBoard/explorerBoardCachePolicy';

describe('explorerBoardCachePolicy', () => {
  it('loads from cache on initial reset', () => {
    expect(
      shouldLoadExplorerBoardFromCache({
        mode: 'reset',
        force: false,
        isInitial: true,
      }),
    ).toBe(true);
  });

  it('skips cache on force refetch', () => {
    expect(
      shouldLoadExplorerBoardFromCache({
        mode: 'reset',
        force: true,
        isInitial: true,
      }),
    ).toBe(false);
  });

  it('persists cache for leaderboard scroll', () => {
    expect(shouldPersistExplorerBoardCache()).toBe(true);
  });
});
