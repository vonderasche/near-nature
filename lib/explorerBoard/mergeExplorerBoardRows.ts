import type { ExplorerBoardMemberRow } from '@/lib/explorerBoard/explorerBoardMemberMap';

/** Appends leaderboard rows without duplicate `userId`s (preserves first occurrence order). */
export function mergeExplorerBoardRows(
  previous: readonly ExplorerBoardMemberRow[],
  pageRows: readonly ExplorerBoardMemberRow[],
): ExplorerBoardMemberRow[] {
  const seen = new Set<string>();
  const out: ExplorerBoardMemberRow[] = [];

  for (const row of [...previous, ...pageRows]) {
    if (seen.has(row.userId)) continue;
    seen.add(row.userId);
    out.push(row);
  }

  return out;
}
