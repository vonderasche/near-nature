import {
  mapDetectionGalleryRows,
  type DetectionGalleryRow,
} from '@/lib/detections/mapDetectionGalleryRow';
import { getDetectionImageDisplayUrlMap } from '@/services/detectionImageUrl';
import type { DetectionGalleryItem } from '@/types';

/** Fast paint from cache; display URLs may be unsigned until {@link hydrateGalleryItemsFromRows} runs. */
export function galleryItemsPlaceholderFromRows(
  rows: readonly DetectionGalleryRow[],
): DetectionGalleryItem[] {
  const displayUrlByStored = new Map<string, string>();
  for (const row of rows) {
    const key = row.image_url.trim();
    if (key) displayUrlByStored.set(key, key);
  }
  return mapDetectionGalleryRows(rows, displayUrlByStored);
}

/** Resolves signed display URLs (in-memory cache + expo-image disk cache). */
export async function hydrateGalleryItemsFromRows(
  rows: readonly DetectionGalleryRow[],
): Promise<DetectionGalleryItem[]> {
  if (rows.length === 0) return [];
  const displayUrlByStored = await getDetectionImageDisplayUrlMap(
    rows.map((row) => row.image_url),
  );
  return mapDetectionGalleryRows(rows, displayUrlByStored);
}
