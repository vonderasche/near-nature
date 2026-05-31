import { isLocalDetectionsMode } from '@/lib/config/isLocalDetectionsMode';
import {
  mapPublicExploreDetectionRows,
  type PublicExploreDetectionRow,
} from '@/lib/detections/mapPublicExploreDetectionRows';
import { filterDetectionGalleryRows } from '@/lib/detections/filterDetectionGalleryItems';
import { isPublicExploreRpcMissing } from '@/lib/detections/isPublicExploreRpcMissing';
import { isSearchQueryActive } from '@/lib/search/normalizeSearchQuery';
import { supabase } from '@/lib/supabase';
import { getDetectionImageDisplayUrlMap } from '@/services/detectionImageUrl';
import type { DetectionGalleryItem } from '@/types';

import { GALLERY_PAGE_SIZE } from '@/services/detectionGalleryService';

export { GALLERY_PAGE_SIZE as PUBLIC_EXPLORE_PAGE_SIZE };

export type FetchPublicDetectionExplorePageParams = {
  query: string;
  offset: number;
  pageSize?: number;
};

export type FetchPublicDetectionExplorePageResult = {
  items: DetectionGalleryItem[];
  hasMore: boolean;
  totalCount: number | null;
};

const EXPLORE_SELECT =
  'id, user_id, image_url, detected_at, common_name, latin_name, category, subcategory, main_category, description, native_status, users!inner(username)';

function mapPostgrestRow(row: Record<string, unknown>): PublicExploreDetectionRow {
  const users = row.users as { username?: string } | null | undefined;
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    username: String(users?.username ?? 'member'),
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

function mapRpcRow(row: Record<string, unknown>): PublicExploreDetectionRow {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    username: String(row.username ?? 'member'),
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

function applyLocalExplorePage(
  all: readonly PublicExploreDetectionRow[],
  query: string,
  offset: number,
  pageSize: number,
): { rows: PublicExploreDetectionRow[]; hasMore: boolean; totalCount: number } {
  const matchingIds = new Set(
    filterDetectionGalleryRows([...all], query).map((row) => row.id),
  );
  const filtered = all.filter((row) => matchingIds.has(row.id));
  const pageRows = filtered.slice(offset, offset + pageSize);
  return {
    rows: pageRows,
    hasMore: offset + pageSize < filtered.length,
    totalCount: filtered.length,
  };
}

async function fetchExploreRowsViaRpc(
  query: string,
  offset: number,
  pageSize: number,
): Promise<{ rows: PublicExploreDetectionRow[]; hasMore: boolean; totalCount: number | null }> {
  const { data, error } = await supabase.rpc('search_public_detections', {
    p_query: query.trim(),
    p_offset: offset,
    p_limit: pageSize,
  });

  if (error) throw error;

  const raw = (data ?? []) as Array<Record<string, unknown>>;
  const totalCount =
    raw.length > 0 && raw[0].total_count != null ? Number(raw[0].total_count) : null;
  const rows = raw.map(mapRpcRow);
  const hasMore = totalCount != null ? offset + rows.length < totalCount : false;

  return { rows, hasMore, totalCount };
}

async function fetchExploreRowsViaPostgrest(
  offset: number,
  pageSize: number,
): Promise<PublicExploreDetectionRow[]> {
  const { data, error } = await supabase
    .from('detections')
    .select(EXPLORE_SELECT)
    .eq('is_sensitive', false)
    .order('detected_at', { ascending: false })
    .range(0, 499);

  if (error) throw error;

  return (data ?? []).map((row) => mapPostgrestRow(row as Record<string, unknown>));
}

async function fetchExploreRowsPage(
  query: string,
  offset: number,
  pageSize: number,
): Promise<{ rows: PublicExploreDetectionRow[]; hasMore: boolean; totalCount: number | null }> {
  if (isLocalDetectionsMode()) {
    return { rows: [], hasMore: false, totalCount: 0 };
  }

  try {
    return await fetchExploreRowsViaRpc(query, offset, pageSize);
  } catch (error) {
    const err = error as { code?: string; message?: string };
    if (!isPublicExploreRpcMissing(err)) throw error;

    const all = await fetchExploreRowsViaPostgrest(offset, pageSize);
    const local = applyLocalExplorePage(all, query, offset, pageSize);
    return {
      rows: local.rows,
      hasMore: local.hasMore,
      totalCount: local.totalCount,
    };
  }
}

export async function fetchPublicDetectionExplorePage({
  query,
  offset,
  pageSize = GALLERY_PAGE_SIZE,
}: FetchPublicDetectionExplorePageParams): Promise<FetchPublicDetectionExplorePageResult> {
  const trimmed = query.trim();
  if (!isSearchQueryActive(trimmed)) {
    return { items: [], hasMore: false, totalCount: null };
  }

  const { rows, hasMore, totalCount } = await fetchExploreRowsPage(trimmed, offset, pageSize);
  if (rows.length === 0) {
    return { items: [], hasMore: false, totalCount: totalCount ?? 0 };
  }

  const displayUrlByStored = await getDetectionImageDisplayUrlMap(rows.map((row) => row.image_url));
  const items = mapPublicExploreDetectionRows(rows, displayUrlByStored);

  return { items, hasMore, totalCount };
}
