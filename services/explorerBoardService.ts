import {
  mapExplorerBoardMemberRow,
  type ExplorerBoardMemberRow,
} from '@/lib/explorerBoard/explorerBoardMemberMap';
import { supabase } from '@/lib/supabase';

export type { ExplorerBoardMemberRow };
export { mapExplorerBoardMemberRow };

export const EXPLORER_BOARD_PAGE_SIZE = 20;

export type FetchExplorerBoardPageParams = {
  offset: number;
  pageSize?: number;
};

export type FetchExplorerBoardPageResult = {
  rows: ExplorerBoardMemberRow[];
  hasMore: boolean;
};

/** In-memory slice when only the legacy (non-paginated) RPC exists. */
let legacyExplorerBoardCache: ExplorerBoardMemberRow[] | null = null;
let explorerBoardPaginationMode: 'server' | 'legacy' | 'unknown' = 'unknown';

export function clearLegacyExplorerBoardCache(): void {
  legacyExplorerBoardCache = null;
  explorerBoardPaginationMode = 'unknown';
}

function pageFromRawRows(raw: unknown[], pageSize: number): FetchExplorerBoardPageResult {
  const hasMore = raw.length > pageSize;
  const page = hasMore ? raw.slice(0, pageSize) : raw;
  return {
    rows: page.map(mapExplorerBoardMemberRow),
    hasMore,
  };
}

/** PostgREST error when `get_detection_count_leaderboard(int, int)` is not deployed yet. */
export function isPaginatedExplorerBoardRpcMissing(error: {
  message?: string;
  code?: string;
}): boolean {
  const msg = (error.message ?? '').toLowerCase();
  return (
    msg.includes('get_detection_count_leaderboard') &&
    (msg.includes('schema cache') ||
      msg.includes('could not find the function') ||
      msg.includes('does not exist'))
  );
}

async function fetchLegacyExplorerBoardAll(): Promise<ExplorerBoardMemberRow[]> {
  if (legacyExplorerBoardCache) return legacyExplorerBoardCache;

  const { data, error } = await supabase.rpc('get_detection_count_leaderboard', {});
  if (error) throw error;

  const rows = (Array.isArray(data) ? data : []).map(mapExplorerBoardMemberRow);
  legacyExplorerBoardCache = rows;
  return rows;
}

async function fetchExplorerBoardPageLegacy({
  offset,
  pageSize = EXPLORER_BOARD_PAGE_SIZE,
}: FetchExplorerBoardPageParams): Promise<FetchExplorerBoardPageResult> {
  const all = await fetchLegacyExplorerBoardAll();
  const rawSlice = all.slice(offset, offset + pageSize + 1);
  const hasMore = rawSlice.length > pageSize;
  const page = hasMore ? rawSlice.slice(0, pageSize) : rawSlice;
  return { rows: page, hasMore };
}

/**
 * One page of the Explorer board (native species rank).
 * Uses `get_detection_count_leaderboard(p_limit, p_offset)` when deployed; otherwise
 * falls back to the legacy no-arg RPC and paginates in memory.
 */
export async function fetchExplorerBoardPage({
  offset,
  pageSize = EXPLORER_BOARD_PAGE_SIZE,
}: FetchExplorerBoardPageParams): Promise<FetchExplorerBoardPageResult> {
  if (explorerBoardPaginationMode !== 'legacy') {
    const { data, error } = await supabase.rpc('get_detection_count_leaderboard', {
      p_limit: pageSize + 1,
      p_offset: offset,
    });

    if (!error) {
      legacyExplorerBoardCache = null;
      explorerBoardPaginationMode = 'server';
      const raw = Array.isArray(data) ? data : [];
      return pageFromRawRows(raw, pageSize);
    }

    if (!isPaginatedExplorerBoardRpcMissing(error)) throw error;
    explorerBoardPaginationMode = 'legacy';
  }

  return fetchExplorerBoardPageLegacy({ offset, pageSize });
}
