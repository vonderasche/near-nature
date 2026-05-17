import { leaderboardMemberTileImageUrl } from '@/lib/explorerBoard/latestLeaderboardGalleryImage';
import type { DetectionLeaderboardRow } from '@/lib/leaderboard/detectionCountLeaderboardMap';

/** Unique tile image URLs for explorer board rows (latest gallery image or avatar). */
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
    add(leaderboardMemberTileImageUrl(row));
    add(row.avatarUrl);
  }

  return urls;
}
