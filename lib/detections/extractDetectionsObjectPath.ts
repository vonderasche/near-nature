import { DETECTIONS_BUCKET } from '@/lib/detections/detectionsBucket';

/**
 * Parses the object path inside `detections` from the URL stored by `getPublicUrl`.
 * Query params (e.g. cache-bust `?v=`) are ignored.
 */
export function extractDetectionsObjectPathFromStoredUrl(storedUrl: string): string | null {
  try {
    const u = new URL(storedUrl);
    const prefix = `/storage/v1/object/public/${DETECTIONS_BUCKET}/`;
    const idx = u.pathname.indexOf(prefix);
    if (idx === -1) return null;
    return decodeURIComponent(u.pathname.slice(idx + prefix.length));
  } catch {
    return null;
  }
}
