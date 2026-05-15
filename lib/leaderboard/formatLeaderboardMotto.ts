/** Trimmed motto for leaderboard rows, or null when empty / missing. */
export function parseLeaderboardMotto(value: string | null | undefined): string | null {
  if (value == null) return null;
  const t = value.trim();
  return t.length > 0 ? t : null;
}
