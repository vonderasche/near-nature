import { explorerBoardMemberTileImageUrl } from '@/lib/explorerBoard/latestExplorerBoardGalleryImage';
import type { ExplorerBoardMemberRow } from '@/lib/explorerBoard/explorerBoardMemberMap';

/** Unique tile image URLs for Explorer board rows (latest gallery image or avatar). */
export function collectExplorerBoardImageStoredUrls(rows: readonly ExplorerBoardMemberRow[]): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  const add = (raw: string | null | undefined) => {
    const trimmed = raw?.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    urls.push(trimmed);
  };

  for (const row of rows) {
    add(explorerBoardMemberTileImageUrl(row));
    add(row.avatarUrl);
  }

  return urls;
}
