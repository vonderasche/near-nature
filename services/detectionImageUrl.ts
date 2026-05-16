import { extractDetectionsObjectPathFromStoredUrl } from '@/lib/detections/extractDetectionsObjectPath';
import { createDetectionsSignedUrl } from '@/lib/detections/detectionsStorage';
import { devWarn } from '@/lib/devLog';

export { extractDetectionsObjectPathFromStoredUrl } from '@/lib/detections/extractDetectionsObjectPath';

const SIGNED_URL_EXPIRY_SEC = 60 * 60 * 24; // 24h — refreshed on gallery refetch

/**
 * Returns a URL that works in `<Image />` for the current session (signed URL for private bucket objects).
 */
export async function getDetectionImageDisplayUrl(storedUrl: string): Promise<string> {
  const path = extractDetectionsObjectPathFromStoredUrl(storedUrl);
  if (!path) return storedUrl;

  const res = await createDetectionsSignedUrl(path, SIGNED_URL_EXPIRY_SEC);
  if (!res.ok) {
    devWarn('[detectionImageUrl] createSignedUrl failed', res.message);
    return storedUrl;
  }

  return res.signedUrl;
}
