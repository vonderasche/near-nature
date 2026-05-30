import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';

export function parseLocalDetectionRows(raw: string | null): DetectionGalleryRow[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is DetectionGalleryRow =>
        !!row &&
        typeof row === 'object' &&
        typeof (row as DetectionGalleryRow).id === 'string' &&
        typeof (row as DetectionGalleryRow).image_url === 'string',
    );
  } catch {
    return [];
  }
}
