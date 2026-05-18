import { mapRowNativeStatus } from '@/lib/detections/galleryNativeCategory';
import type { DetectionGalleryItem } from '@/types';

export type DetectionGalleryRow = {
  id: string;
  image_url: string;
  detected_at: string;
  common_name: string;
  latin_name: string;
  category: string;
  description: string | null;
  native_status: string | null;
};

/** Maps DB rows to gallery items using pre-resolved display URLs. */
export function mapDetectionGalleryRows(
  rows: readonly DetectionGalleryRow[],
  displayUrlByStored: ReadonlyMap<string, string>,
): DetectionGalleryItem[] {
  return rows.map((row): DetectionGalleryItem => {
    const imageUrl = row.image_url;
    const trimmedStored = imageUrl.trim();
    const displayUrl = displayUrlByStored.get(trimmedStored) ?? imageUrl;
    const description =
      typeof row.description === 'string' && row.description.trim().length > 0
        ? row.description.trim()
        : null;

    const { nativeStatus, nativeCategory } = mapRowNativeStatus(row.native_status);

    return {
      id: row.id,
      imageUrl,
      displayUrl,
      detectedAt: row.detected_at,
      commonName: row.common_name,
      latinName: row.latin_name,
      category: String(row.category ?? 'other'),
      description,
      nativeStatus,
      nativeCategory,
    };
  });
}
