import { hydrateGalleryItemsFromRows } from '@/lib/detections/hydrateGalleryItems';
import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';
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
