import { describe, expect, it } from 'vitest';

import { mergeExplorerBoardRows } from '@/lib/explorerBoard/mergeExplorerBoardRows';
import type { ExplorerBoardMemberRow } from '@/lib/explorerBoard/explorerBoardMemberMap';

function row(userId: string, rank: number): ExplorerBoardMemberRow {
  return {
    rank,
    userId,
    username: userId,
    avatarUrl: null,
    motto: null,
    pointsTotal: rank,
    recentDetectionImageUrls: [],
    nativeSpeciesCount: 0,
    nonNativeSpeciesCount: 0,
  };
}

describe('mergeExplorerBoardRows', () => {
  it('deduplicates by userId when appending pages', () => {
    const merged = mergeExplorerBoardRows([row('a', 1)], [row('a', 1), row('b', 2)]);
    expect(merged).toHaveLength(2);
    expect(merged.map((r) => r.userId)).toEqual(['a', 'b']);
  });
});
