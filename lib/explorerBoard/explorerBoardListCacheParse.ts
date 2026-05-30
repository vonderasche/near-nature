import {
  EXPLORER_BOARD_LIST_CACHE_VERSION,
  type ExplorerBoardListCacheVersion,
} from '@/constants/explorer-board-cache';
import type { ExplorerBoardMemberRow } from '@/lib/explorerBoard/explorerBoardMemberMap';

export type CachedExplorerBoardList = {
  v: ExplorerBoardListCacheVersion;
  rows: ExplorerBoardMemberRow[];
  hasMore: boolean;
  cachedAt: number;
};

function isMemberRow(value: unknown): value is ExplorerBoardMemberRow {
  if (!value || typeof value !== 'object') return false;
  const row = value as ExplorerBoardMemberRow;
  return (
    typeof row.rank === 'number' &&
    typeof row.userId === 'string' &&
    typeof row.username === 'string' &&
    typeof row.pointsTotal === 'number' &&
    typeof row.nativeSpeciesCount === 'number' &&
    typeof row.nonNativeSpeciesCount === 'number' &&
    Array.isArray(row.recentDetectionImageUrls)
  );
}

export function parseCachedExplorerBoardList(raw: string | null): CachedExplorerBoardList | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachedExplorerBoardList;
    if (parsed.v !== EXPLORER_BOARD_LIST_CACHE_VERSION) return null;
    if (!Array.isArray(parsed.rows) || !parsed.rows.every(isMemberRow)) return null;
    if (typeof parsed.hasMore !== 'boolean') return null;
    if (typeof parsed.cachedAt !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}
