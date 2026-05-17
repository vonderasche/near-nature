import { matchesSearchInFields } from '@/lib/search/matchesSearchQuery';
import type { DetectionLeaderboardRow } from '@/lib/leaderboard/detectionCountLeaderboardMap';

/** Matches username and motto. */
export function filterLeaderboardRows(
  rows: readonly DetectionLeaderboardRow[],
  query: string,
): DetectionLeaderboardRow[] {
  const trimmed = query.trim();
  if (!trimmed) return [...rows];

  return rows.filter((row) => matchesSearchInFields([row.username, row.motto], trimmed));
}
