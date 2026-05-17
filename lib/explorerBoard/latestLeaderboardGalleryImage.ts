import type { DetectionLeaderboardRow } from '@/lib/leaderboard/detectionCountLeaderboardMap';

/** Most recent public identification image (gallery order: newest first). */
export function latestLeaderboardGalleryImageUrl(
  row: Pick<DetectionLeaderboardRow, 'recentDetectionImageUrls'>,
): string | null {
  const first = row.recentDetectionImageUrls[0]?.trim();
  return first && first.length > 0 ? first : null;
}

/** Gallery image when present; otherwise profile avatar for the tile. */
export function leaderboardMemberTileImageUrl(
  row: Pick<DetectionLeaderboardRow, 'recentDetectionImageUrls' | 'avatarUrl'>,
): string | null {
  return latestLeaderboardGalleryImageUrl(row) ?? row.avatarUrl?.trim() ?? null;
}
