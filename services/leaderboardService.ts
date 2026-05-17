import {
  mapDetectionLeaderboardRpcRow,
  type DetectionLeaderboardRow,
} from '@/lib/leaderboard/detectionCountLeaderboardMap';
import { supabase } from '@/lib/supabase';

export type { DetectionLeaderboardRow };
export { mapDetectionLeaderboardRpcRow };

export const EXPLORER_BOARD_PAGE_SIZE = 20;

export type FetchDetectionLeaderboardPageParams = {
  offset: number;
  pageSize?: number;
};

export type FetchDetectionLeaderboardPageResult = {
  rows: DetectionLeaderboardRow[];
  hasMore: boolean;
};

/** In-memory slice when only the legacy (non-paginated) RPC exists. */
let legacyLeaderboardCache: DetectionLeaderboardRow[] | null = null;
let leaderboardPaginationMode: 'server' | 'legacy' | 'unknown' = 'unknown';

export function clearLegacyLeaderboardCache(): void {
  legacyLeaderboardCache = null;
  leaderboardPaginationMode = 'unknown';
}

function pageFromRawRows(
  raw: unknown[],
  pageSize: number,
): FetchDetectionLeaderboardPageResult {
  const hasMore = raw.length > pageSize;
  const page = hasMore ? raw.slice(0, pageSize) : raw;
  return {
    rows: page.map(mapDetectionLeaderboardRpcRow),
    hasMore,
  };
}

/** PostgREST error when `get_detection_count_leaderboard(int, int)` is not deployed yet. */
export function isPaginatedLeaderboardRpcMissing(error: {
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

async function fetchLegacyLeaderboardAll(): Promise<DetectionLeaderboardRow[]> {
  if (legacyLeaderboardCache) return legacyLeaderboardCache;

  const { data, error } = await supabase.rpc('get_detection_count_leaderboard', {});
  if (error) throw error;

  const rows = (Array.isArray(data) ? data : []).map(mapDetectionLeaderboardRpcRow);
  legacyLeaderboardCache = rows;
  return rows;
}

async function fetchDetectionLeaderboardPageLegacy({
  offset,
  pageSize,
}: FetchDetectionLeaderboardPageParams): Promise<FetchDetectionLeaderboardPageResult> {
  const all = await fetchLegacyLeaderboardAll();
  const rawSlice = all.slice(offset, offset + pageSize + 1);
  const hasMore = rawSlice.length > pageSize;
  const page = hasMore ? rawSlice.slice(0, pageSize) : rawSlice;
  return { rows: page, hasMore };
}

/**
 * One page of the explorer board (native species rank).
 * Uses `get_detection_count_leaderboard(p_limit, p_offset)` when deployed; otherwise
 * falls back to the legacy no-arg RPC and paginates in memory.
 */
export async function fetchDetectionLeaderboardPage({
  offset,
  pageSize = EXPLORER_BOARD_PAGE_SIZE,
}: FetchDetectionLeaderboardPageParams): Promise<FetchDetectionLeaderboardPageResult> {
  if (leaderboardPaginationMode !== 'legacy') {
    const { data, error } = await supabase.rpc('get_detection_count_leaderboard', {
      p_limit: pageSize + 1,
      p_offset: offset,
    });

    if (!error) {
      legacyLeaderboardCache = null;
      leaderboardPaginationMode = 'server';
      const raw = Array.isArray(data) ? data : [];
      return pageFromRawRows(raw, pageSize);
    }

    if (!isPaginatedLeaderboardRpcMissing(error)) throw error;
    leaderboardPaginationMode = 'legacy';
  }

  return fetchDetectionLeaderboardPageLegacy({ offset, pageSize });
}
