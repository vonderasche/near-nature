import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';

export type StoredUserDetectionMeta = {
  confidence?: number | null;
  state?: string | null;
  inaturalistId?: string | null;
  isSensitive?: boolean;
  points?: number;
};

export type UserDetectionRow = DetectionGalleryRow & {
  user_id: string;
  confidence: number | null;
  state: string | null;
  inaturalist_id: string | null;
  is_sensitive: number;
  points: number;
  synced_at: number;
  created_at: number;
};

export function mapUserDetectionRowToGalleryRow(row: UserDetectionRow): DetectionGalleryRow {
  return {
    id: row.id,
    image_url: row.image_url,
    detected_at: row.detected_at,
    common_name: row.common_name,
    latin_name: row.latin_name,
    category: row.category,
    subcategory: row.subcategory,
    main_category: row.main_category,
    description: row.description,
    native_status: row.native_status,
  };
}
