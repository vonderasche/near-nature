import { hydrateGalleryItemsFromRows } from '@/lib/detections/hydrateGalleryItems';
import {
  getPendingGalleryItems,
  mergePendingAndServerGalleryItems,
} from '@/lib/detections/pendingGalleryDetection';
import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';
import type { DetectionGalleryItem } from '@/types';

/**
 * Hydrates server rows (signed URLs) and prepends optimistic pending tiles for the owner gallery.
 */
export async function buildOwnerGalleryDisplayItems(
  userId: string,
  serverRows: readonly DetectionGalleryRow[],
): Promise<DetectionGalleryItem[]> {
  const pending = getPendingGalleryItems(userId);
  const serverItems = await hydrateGalleryItemsFromRows(serverRows);
  return mergePendingAndServerGalleryItems(pending, serverItems);
}
