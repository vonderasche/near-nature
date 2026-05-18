import { mapDetectionGalleryRows, type DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';
import { getDetectionImageDisplayUrlMap } from '@/services/detectionImageUrl';
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

export type FetchUserDetectionGalleryPageResult = {
  items: DetectionGalleryItem[];
  hasMore: boolean;
};

/**
 * Fetches one page of detection gallery rows (newest first).
 * Requests `pageSize + 1` rows to detect whether another page exists.
 */
export async function fetchUserDetectionGalleryPage({
  userId,
  publicOnly = false,
  offset,
  pageSize = GALLERY_PAGE_SIZE,
}: FetchUserDetectionGalleryPageParams): Promise<FetchUserDetectionGalleryPageResult> {
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

  const displayUrlByStored = await getDetectionImageDisplayUrlMap(
    pageRows.map((row) => row.image_url),
  );

  return {
    items: mapDetectionGalleryRows(pageRows, displayUrlByStored),
    hasMore,
  };
}
