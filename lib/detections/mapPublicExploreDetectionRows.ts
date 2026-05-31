import {
  mapDetectionGalleryRows,
  type DetectionGalleryRow,
} from '@/lib/detections/mapDetectionGalleryRow';
import type { DetectionGalleryItem } from '@/types';

export type PublicExploreDetectionRow = DetectionGalleryRow & {
  user_id: string;
  username: string;
};

export function mapPublicExploreDetectionRows(
  rows: readonly PublicExploreDetectionRow[],
  displayUrlByStored: ReadonlyMap<string, string>,
): DetectionGalleryItem[] {
  const galleryItems = mapDetectionGalleryRows(rows, displayUrlByStored);
  return galleryItems.map((item, index) => {
    const row = rows[index];
    return {
      ...item,
      ownerUserId: row.user_id,
      ownerUsername: row.username,
    };
  });
}
