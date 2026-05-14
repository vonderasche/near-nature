import { supabase } from '@/lib/supabase';

export const DETECTIONS_BUCKET = 'detections';

const SIGNED_URL_EXPIRY_SEC = 60 * 60 * 24; // 24h — refreshed on gallery refetch

/**
 * Parses the object path inside `detections` from the URL stored by `getPublicUrl`.
 * Private buckets still use the `/object/public/{bucket}/…` path shape; those URLs are not anonymously readable.
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

/**
 * Returns a URL that works in `<Image />` for the current session (signed URL for private bucket objects).
 */
export async function getDetectionImageDisplayUrl(storedUrl: string): Promise<string> {
  const path = extractDetectionsObjectPathFromStoredUrl(storedUrl);
  if (!path) return storedUrl;

  const { data, error } = await supabase.storage
    .from(DETECTIONS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SEC);

  if (error || !data?.signedUrl) {
    if (__DEV__) {
      console.warn('[detectionImageUrl] createSignedUrl failed', error?.message ?? 'no signedUrl');
    }
    return storedUrl;
  }

  return data.signedUrl;
}
