import type { ExplorerBoardMemberRow } from '@/lib/explorerBoard/explorerBoardMemberMap';
import { matchesSearchInFields } from '@/lib/search/matchesSearchQuery';

/** Matches username and motto. */
export function filterExplorerBoardRows(
  rows: readonly ExplorerBoardMemberRow[],
  query: string,
): ExplorerBoardMemberRow[] {
  const trimmed = query.trim();
  if (!trimmed) return [...rows];

  return rows.filter((row) => matchesSearchInFields([row.username, row.motto], trimmed));
}
