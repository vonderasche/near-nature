import { isLocalDetectionsMode } from '@/lib/config/isLocalDetectionsMode';
import { devLog } from '@/lib/devLog';
import { upsertUserDetections } from '@/lib/db/detectionRepository';
import { isSqliteUserCacheAvailable } from '@/lib/db/sqliteCacheSupport';
import { filterDetectionGalleryRows } from '@/lib/detections/filterDetectionGalleryItems';
import {
  toGalleryListFilterParams,
  type GalleryListFilterParams,
} from '@/lib/detections/galleryCategoryFilterParams';
import type { GalleryCategoryFilter } from '@/lib/detections/filterDetectionGalleryItems';
import { hydrateGalleryItemsFromRows } from '@/lib/detections/hydrateGalleryItems';
import { loadLocalDetectionRows } from '@/lib/detections/localDetectionStore';
import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';
import { isSearchQueryActive } from '@/lib/search/normalizeSearchQuery';
import { supabase } from '@/lib/supabase';
import type { DetectionGalleryItem } from '@/types';

export const GALLERY_PAGE_SIZE = 18;

const GALLERY_SELECT =
  'id, image_url, detected_at, common_name, latin_name, category, subcategory, main_category, description, native_status';

export type FetchUserDetectionGalleryPageParams = {
  userId: string;
  publicOnly?: boolean;
  offset: number;
  pageSize?: number;
  query?: string;
  categoryFilter?: GalleryCategoryFilter;
};

export type FetchUserDetectionGalleryRowsPageResult = {
  rows: DetectionGalleryRow[];
  hasMore: boolean;
  /** Set when loaded via `search_user_detections` RPC. */
  totalCount: number | null;
};

export type FetchUserDetectionGalleryPageResult = {
  items: DetectionGalleryItem[];
  hasMore: boolean;
  totalCount: number | null;
  /** DB rows for device cache (no signed URLs). */
  rows: DetectionGalleryRow[];
};

function mapRpcRow(row: Record<string, unknown>): DetectionGalleryRow {
  return {
    id: String(row.id),
    image_url: String(row.image_url),
    detected_at: String(row.detected_at),
    common_name: String(row.common_name),
    latin_name: String(row.latin_name),
    category: String(row.category),
    subcategory: row.subcategory != null ? String(row.subcategory) : null,
    main_category: row.main_category != null ? String(row.main_category) : null,
    description: row.description != null ? String(row.description) : null,
    native_status: row.native_status != null ? String(row.native_status) : null,
  };
}

function isGalleryRpcUnavailable(error: { code?: string; message?: string }): boolean {
  const message = (error.message ?? '').toLowerCase();
  return (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    message.includes('search_user_detections') ||
    message.includes('does not exist')
  );
}

function applyLocalGalleryPage(
  all: readonly DetectionGalleryRow[],
  query: string,
  categoryFilter: GalleryCategoryFilter,
  offset: number,
  pageSize: number,
): FetchUserDetectionGalleryRowsPageResult {
  const filtered = filterDetectionGalleryRows(all, query, undefined, categoryFilter);
  const pageRows = filtered.slice(offset, offset + pageSize);
  const hasMore = offset + pageSize < filtered.length;
  return {
    rows: pageRows,
    hasMore,
    totalCount: isSearchQueryActive(query) || categoryFilter.kind !== 'all' ? filtered.length : null,
  };
}

async function fetchGalleryRowsViaPostgrest(
  userId: string,
  publicOnly: boolean,
  offset: number,
  pageSize: number,
): Promise<FetchUserDetectionGalleryRowsPageResult> {
  const from = offset;
  const to = offset + pageSize;

  let q = supabase
    .from('detections')
    .select(GALLERY_SELECT)
    .eq('user_id', userId)
    .order('detected_at', { ascending: false })
    .range(from, to);

  if (publicOnly) {
    q = q.eq('is_sensitive', false);
  }

  const { data, error } = await q;
  if (error) throw error;

  const rows = (data ?? []) as DetectionGalleryRow[];
  const hasMore = rows.length > pageSize;
  const pageRows = hasMore ? rows.slice(0, pageSize) : rows;

  return { rows: pageRows, hasMore, totalCount: null };
}

async function fetchGalleryRowsViaRpc(
  userId: string,
  query: string,
  publicOnly: boolean,
  offset: number,
  pageSize: number,
  listFilter: GalleryListFilterParams,
): Promise<FetchUserDetectionGalleryRowsPageResult> {
  const { data, error } = await supabase.rpc('search_user_detections', {
    p_user_id: userId,
    p_query: query.trim(),
    p_public_only: publicOnly,
    p_offset: offset,
    p_limit: pageSize,
    p_filter_group: listFilter.filterGroup,
    p_filter_subcategory: listFilter.filterSubcategory,
  });

  if (error) throw error;

  const raw = (data ?? []) as Array<Record<string, unknown>>;
  const totalCount =
    raw.length > 0 && raw[0].total_count != null ? Number(raw[0].total_count) : null;
  const rows = raw.map(mapRpcRow);
  const hasMore = totalCount != null ? offset + rows.length < totalCount : false;

  return { rows, hasMore, totalCount };
}

function syncGalleryRowsToLocalDb(userId: string, rows: readonly DetectionGalleryRow[]): void {
  if (!isSqliteUserCacheAvailable() || rows.length === 0) return;
  void upsertUserDetections(userId, rows).catch((error) => {
    devLog('[gallery] local detection sync failed', error);
  });
}

/**
 * Fetches one page of gallery rows (browse, search, and category filter).
 * Uses `search_user_detections` when available; falls back to PostgREST + in-app filter.
 */
export async function fetchUserDetectionGalleryRowsPage({
  userId,
  publicOnly = false,
  offset,
  pageSize = GALLERY_PAGE_SIZE,
  query = '',
  categoryFilter = { kind: 'all' },
}: FetchUserDetectionGalleryPageParams): Promise<FetchUserDetectionGalleryRowsPageResult> {
  const trimmed = query.trim();
  const listFilter = toGalleryListFilterParams(categoryFilter);

  let result: FetchUserDetectionGalleryRowsPageResult;

  if (isLocalDetectionsMode()) {
    const all = await loadLocalDetectionRows(userId);
    result = applyLocalGalleryPage(all, trimmed, categoryFilter, offset, pageSize);
  } else {
    try {
      result = await fetchGalleryRowsViaRpc(
        userId,
        trimmed,
        publicOnly,
        offset,
        pageSize,
        listFilter,
      );
    } catch (error) {
      const err = error as { code?: string; message?: string };
      if (!isGalleryRpcUnavailable(err)) throw error;

      if (isSearchQueryActive(trimmed) || categoryFilter.kind !== 'all') {
        const { rows: allRows } = await fetchGalleryRowsViaPostgrest(userId, publicOnly, 0, 500);
        result = applyLocalGalleryPage(allRows, trimmed, categoryFilter, offset, pageSize);
      } else {
        result = await fetchGalleryRowsViaPostgrest(userId, publicOnly, offset, pageSize);
      }
    }
  }

  syncGalleryRowsToLocalDb(userId, result.rows);
  return result;
}

/** @deprecated Use `fetchUserDetectionGalleryRowsPage` with `query` set. */
export type SearchUserDetectionGalleryRowsPageParams = Omit<
  FetchUserDetectionGalleryPageParams,
  'query'
> & { query: string };

export async function searchUserDetectionGalleryRowsPage(
  params: SearchUserDetectionGalleryRowsPageParams,
): Promise<FetchUserDetectionGalleryRowsPageResult> {
  return fetchUserDetectionGalleryRowsPage(params);
}

/**
 * Fetches one page and resolves signed image URLs for display.
 */
export async function fetchUserDetectionGalleryPage(
  params: FetchUserDetectionGalleryPageParams,
): Promise<FetchUserDetectionGalleryPageResult> {
  const { rows, hasMore, totalCount } = await fetchUserDetectionGalleryRowsPage(params);
  const items = await hydrateGalleryItemsFromRows(rows);
  return { items, hasMore, totalCount, rows };
}
