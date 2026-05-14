export type DetectionLeaderboardRow = {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  motto: string | null;
  detectionCount: number;
};

function readNonEmptyString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const v = record[key];
    if (typeof v !== 'string') continue;
    const t = v.trim();
    if (t.length > 0) return t;
  }
  return null;
}

/** Maps one RPC row from `get_detection_count_leaderboard` (snake_case; tolerate missing keys). */
export function mapDetectionLeaderboardRpcRow(raw: unknown): DetectionLeaderboardRow {
  const r =
    raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};

  const rank = Number(r.leaderboard_rank ?? r.leaderboardRank ?? 0);
  const userId = String(r.user_id ?? r.userId ?? '').trim();
  const username = typeof r.username === 'string' ? r.username.trim() : String(r.username ?? '').trim();
  const detectionCount = Number(r.detection_count ?? r.detectionCount ?? 0);

  const avatarUrl = readNonEmptyString(r, ['avatar_url', 'avatarUrl']);
  const motto = readNonEmptyString(r, ['motto', 'Motto']);

  return {
    rank: Number.isFinite(rank) ? rank : 0,
    userId,
    username,
    avatarUrl,
    motto,
    detectionCount: Number.isFinite(detectionCount) ? detectionCount : 0,
  };
}
