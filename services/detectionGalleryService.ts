import { isLocalDetectionsMode } from '@/lib/config/isLocalDetectionsMode';
import { hydrateGalleryItemsFromRows } from '@/lib/detections/hydrateGalleryItems';
import { loadLocalDetectionRows } from '@/lib/detections/localDetectionStore';
import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';
import { filterDetectionGalleryRows } from '@/lib/detections/filterDetectionGalleryItems';
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
};

export type FetchUserDetectionGalleryRowsPageResult = {
  rows: DetectionGalleryRow[];
  hasMore: boolean;
};

export type FetchUserDetectionGalleryPageResult = {
  items: DetectionGalleryItem[];
  hasMore: boolean;
  /** DB rows for device cache (no signed URLs). */
  rows: DetectionGalleryRow[];
};

/**
 * Fetches one page of gallery rows (newest first).
 * Requests `pageSize + 1` rows to detect whether another page exists.
 */
export async function fetchUserDetectionGalleryRowsPage({
  userId,
  publicOnly = false,
  offset,
  pageSize = GALLERY_PAGE_SIZE,
}: FetchUserDetectionGalleryPageParams): Promise<FetchUserDetectionGalleryRowsPageResult> {
  if (isLocalDetectionsMode()) {
    const all = await loadLocalDetectionRows(userId);
    const pageRows = all.slice(offset, offset + pageSize);
    const hasMore = offset + pageSize < all.length;
    return { rows: pageRows, hasMore };
  }

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

  return { rows: pageRows, hasMore };
}

export type SearchUserDetectionGalleryRowsPageParams = {
  userId: string;
  query: string;
  publicOnly?: boolean;
  offset: number;
  pageSize?: number;
};

function isSearchDetectionsRpcUnavailable(error: { code?: string; message?: string }): boolean {
  const message = (error.message ?? '').toLowerCase();
  return (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    message.includes('search_user_detections') ||
    message.includes('does not exist')
  );
}

/**
 * Server-side search (FTS + trigram + token match). Falls back to loading a page and filtering in-app.
 */
export async function searchUserDetectionGalleryRowsPage({
  userId,
  query,
  publicOnly = false,
  offset,
  pageSize = GALLERY_PAGE_SIZE,
}: SearchUserDetectionGalleryRowsPageParams): Promise<FetchUserDetectionGalleryRowsPageResult> {
  const trimmed = query.trim();
  if (!isSearchQueryActive(trimmed)) {
    return fetchUserDetectionGalleryRowsPage({ userId, publicOnly, offset, pageSize });
  }

  if (isLocalDetectionsMode()) {
    const all = await loadLocalDetectionRows(userId);
    const filtered = filterDetectionGalleryRows(all, trimmed);
    const pageRows = filtered.slice(offset, offset + pageSize);
    const hasMore = offset + pageSize < filtered.length;
    return { rows: pageRows, hasMore };
  }

  const { data, error } = await supabase.rpc('search_user_detections', {
    p_user_id: userId,
    p_query: trimmed,
    p_public_only: publicOnly,
    p_offset: offset,
    p_limit: pageSize + 1,
  });

  if (error) {
    if (!isSearchDetectionsRpcUnavailable(error)) throw error;
    const { rows: allRows } = await fetchUserDetectionGalleryRowsPage({
      userId,
      publicOnly,
      offset: 0,
      pageSize: 500,
    });
    const filtered = filterDetectionGalleryRows(allRows, trimmed);
    const pageRows = filtered.slice(offset, offset + pageSize);
    const hasMore = offset + pageSize < filtered.length;
    return { rows: pageRows, hasMore };
  }

  const raw = (data ?? []) as Array<Record<string, unknown>>;
  const hasMore = raw.length > pageSize;
  const slice = hasMore ? raw.slice(0, pageSize) : raw;

  const rows: DetectionGalleryRow[] = slice.map((row) => ({
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
  }));

  return { rows, hasMore };
}

/**
 * Fetches one page and resolves signed image URLs for display.
 */
export async function fetchUserDetectionGalleryPage(
  params: FetchUserDetectionGalleryPageParams,
): Promise<FetchUserDetectionGalleryPageResult> {
  const { rows, hasMore } = await fetchUserDetectionGalleryRowsPage(params);
  const items = await hydrateGalleryItemsFromRows(rows);
  return { items, hasMore, rows };
}
