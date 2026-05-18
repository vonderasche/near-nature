import { createDetectionsSignedUrl } from '@/lib/detections/detectionsStorage';
import { extractDetectionsObjectPathFromStoredUrl } from '@/lib/detections/extractDetectionsObjectPath';
import { loadPersistedSignedUrlMap } from '@/lib/detections/signedDetectionUrlPersistentCache';
import {
  clearSignedDetectionUrlCache,
  resolveSignedDetectionDisplayUrl,
  seedSignedDetectionUrlCache,
} from '@/lib/detections/signedDetectionUrlCache';
import { devWarn } from '@/lib/devLog';

export { extractDetectionsObjectPathFromStoredUrl } from '@/lib/detections/extractDetectionsObjectPath';
export { clearSignedDetectionUrlCache };

const SIGNED_URL_EXPIRY_SEC = 60 * 60 * 24; // 24h — aligned with in-memory cache TTL

/**
 * Returns a URL that works in `<Image />` for the current session (signed URL for private bucket objects).
 * Results are cached in memory per object path; concurrent calls share one signing request.
 */
export async function getDetectionImageDisplayUrl(storedUrl: string): Promise<string> {
  const path = extractDetectionsObjectPathFromStoredUrl(storedUrl);
  if (!path) return storedUrl;

  return resolveSignedDetectionDisplayUrl(
    path,
    SIGNED_URL_EXPIRY_SEC,
    signDetectionsObjectPath,
    storedUrl,
  );
}

async function signDetectionsObjectPath(objectPath: string) {
  const res = await createDetectionsSignedUrl(objectPath, SIGNED_URL_EXPIRY_SEC);
  if (!res.ok) {
    devWarn('[detectionImageUrl] createSignedUrl failed', res.message);
  }
  return res;
}

/**
 * Resolves many stored URLs in parallel (cache + in-flight dedupe per object path).
 */
export async function getDetectionImageDisplayUrlMap(
  storedUrls: readonly string[],
): Promise<Map<string, string>> {
  const unique = [...new Set(storedUrls.map((u) => u.trim()).filter((u) => u.length > 0))];
  if (unique.length === 0) return new Map();

  const pathByStored = new Map<string, string>();
  const objectPaths: string[] = [];
  for (const stored of unique) {
    const path = extractDetectionsObjectPathFromStoredUrl(stored);
    if (path) {
      pathByStored.set(stored, path);
      objectPaths.push(path);
    }
  }

  const persistedByPath = await loadPersistedSignedUrlMap(objectPaths);
  const expiresAtMs = Date.now() + SIGNED_URL_EXPIRY_SEC * 1000;
  for (const [path, signedUrl] of persistedByPath) {
    seedSignedDetectionUrlCache(path, signedUrl, expiresAtMs);
  }

  const entries = await Promise.all(
    unique.map(async (stored) => [stored, await getDetectionImageDisplayUrl(stored)] as const),
  );
  return new Map(entries);
}
