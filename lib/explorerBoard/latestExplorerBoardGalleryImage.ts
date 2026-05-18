import type { ExplorerBoardMemberRow } from '@/lib/explorerBoard/explorerBoardMemberMap';

/** Most recent public identification image (gallery order: newest first). */
export function latestExplorerBoardGalleryImageUrl(
  row: Pick<ExplorerBoardMemberRow, 'recentDetectionImageUrls'>,
): string | null {
  const first = row.recentDetectionImageUrls[0]?.trim();
  return first && first.length > 0 ? first : null;
}

/** Gallery image when present; otherwise profile avatar for the tile. */
export function explorerBoardMemberTileImageUrl(
  row: Pick<ExplorerBoardMemberRow, 'recentDetectionImageUrls' | 'avatarUrl'>,
): string | null {
  return latestExplorerBoardGalleryImageUrl(row) ?? row.avatarUrl?.trim() ?? null;
}
