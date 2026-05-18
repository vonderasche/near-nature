import { describe, expect, it } from 'vitest';

import type { ExplorerBoardMemberRow } from '@/lib/explorerBoard/explorerBoardMemberMap';
import { filterExplorerBoardRows } from '@/lib/explorerBoard/filterExplorerBoardRows';

function row(overrides: Partial<ExplorerBoardMemberRow>): ExplorerBoardMemberRow {
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

describe('filterExplorerBoardRows', () => {
  const rows = [
    row({ userId: 'u1', username: 'nature_fan', motto: 'Watching wildlife' }),
    row({ userId: 'u2', username: 'plant_lover', motto: 'Botany every day' }),
  ];

  it('matches username', () => {
    expect(filterExplorerBoardRows(rows, 'plant').map((r) => r.userId)).toEqual(['u2']);
  });

  it('matches motto text', () => {
    expect(filterExplorerBoardRows(rows, 'botany').map((r) => r.userId)).toEqual(['u2']);
  });
});
