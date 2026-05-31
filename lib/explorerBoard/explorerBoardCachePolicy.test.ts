import { describe, expect, it } from 'vitest';

import {
  shouldLoadExplorerBoardFromCache,
  shouldPersistExplorerBoardCache,
} from '@/lib/explorerBoard/explorerBoardCachePolicy';

describe('explorerBoardCachePolicy', () => {
  it('loads from cache on initial reset without search', () => {
    expect(
      shouldLoadExplorerBoardFromCache({
        mode: 'reset',
        force: false,
        isInitial: true,
        searchQuery: '',
      }),
    ).toBe(true);
  });

  it('skips cache when search is active', () => {
    expect(
      shouldLoadExplorerBoardFromCache({
        mode: 'reset',
        force: false,
        isInitial: true,
        searchQuery: 'motto',
      }),
    ).toBe(false);
  });

  it('skips cache on force refetch', () => {
    expect(
      shouldLoadExplorerBoardFromCache({
        mode: 'reset',
        force: true,
        isInitial: true,
        searchQuery: '',
      }),
    ).toBe(false);
  });

  it('does not persist cache while searching', () => {
    expect(shouldPersistExplorerBoardCache('nature')).toBe(false);
    expect(shouldPersistExplorerBoardCache('')).toBe(true);
  });
});
