import type { DetectionLeaderboardRow } from '@/lib/leaderboard/detectionCountLeaderboardMap';

/** Unique stored image URLs from explorer board rows (avatars + recent identification previews). */
export function collectLeaderboardImageStoredUrls(rows: readonly DetectionLeaderboardRow[]): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  const add = (raw: string | null | undefined) => {
    const trimmed = raw?.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    urls.push(trimmed);
  };

  for (const row of rows) {
    add(row.avatarUrl);
    for (const preview of row.recentDetectionImageUrls) {
      add(preview);
    }
  }

  return urls;
}
