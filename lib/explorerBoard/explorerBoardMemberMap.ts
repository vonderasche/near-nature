export type ExplorerBoardMemberRow = {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  motto: string | null;
  /** Sum of `detections.points` on non-sensitive saves. */
  pointsTotal: number;
  /** Latest public identification image URL(s); newest first (RPC returns one). */
  recentDetectionImageUrls: string[];
  /** Distinct latin names with native_status = native. */
  nativeSpeciesCount: number;
  /** Distinct latin names with native_status invasive or unknown. */
  nonNativeSpeciesCount: number;
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

function readCount(record: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const n = Number(record[key]);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return 0;
}

function readStringArray(record: Record<string, unknown>, keys: string[]): string[] {
  for (const key of keys) {
    const v = record[key];
    if (!Array.isArray(v)) continue;
    return v
      .filter((entry): entry is string => typeof entry === 'string')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }
  return [];
}

/** Maps one Explorer Board RPC row from `get_detection_count_leaderboard` (snake_case; tolerate missing keys). */
export function mapExplorerBoardMemberRow(raw: unknown): ExplorerBoardMemberRow {
  const r =
    raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};

  const rank = Number(r.leaderboard_rank ?? r.leaderboardRank ?? 0);
  const userId = String(r.user_id ?? r.userId ?? '').trim();
  const username = typeof r.username === 'string' ? r.username.trim() : String(r.username ?? '').trim();

  const avatarUrl = readNonEmptyString(r, ['avatar_url', 'avatarUrl']);
  const motto = readNonEmptyString(r, ['motto', 'Motto']);

  const pointsTotal = readCount(r, [
    'total_points',
    'totalPoints',
    'public_points',
    'publicPoints',
    'public_post_count',
    'publicPostCount',
  ]);
  const recentDetectionImageUrls = readStringArray(r, [
    'recent_detection_image_urls',
    'recentDetectionImageUrls',
    'recent_post_image_urls',
    'recentPostImageUrls',
  ]);
  const nativeSpeciesCount = readCount(r, [
    'native_species_count',
    'nativeSpeciesCount',
    'detection_count',
    'detectionCount',
  ]);
  const nonNativeSpeciesCount = readCount(r, [
    'non_native_species_count',
    'nonNativeSpeciesCount',
    'non_native_count',
    'nonNativeCount',
  ]);

  return {
    rank: Number.isFinite(rank) ? rank : 0,
    userId,
    username,
    avatarUrl,
    motto,
    pointsTotal,
    recentDetectionImageUrls,
    nativeSpeciesCount,
    nonNativeSpeciesCount,
  };
}
