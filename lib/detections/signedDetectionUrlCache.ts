import type { CreateDetectionsSignedUrlResult } from '@/lib/detections/detectionsStorage';

type CacheEntry = {
  signedUrl: string;
  expiresAtMs: number;
};

/** Refresh slightly before Supabase expiry so images do not 403 mid-session. */
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<string>>();

export type SignDetectionObjectPath = (
  objectPath: string,
) => Promise<CreateDetectionsSignedUrlResult>;

/** Clears cached signed URLs (e.g. tests or after sign-out). */
export function clearSignedDetectionUrlCache(): void {
  cache.clear();
  inFlight.clear();
}

/**
 * Returns a signed display URL for a detections bucket object path.
 * Caches successful results in memory and dedupes concurrent requests per path.
 */
export async function resolveSignedDetectionDisplayUrl(
  objectPath: string,
  expiresInSeconds: number,
  sign: SignDetectionObjectPath,
  fallbackUrl: string,
): Promise<string> {
  const trimmedPath = objectPath.trim();
  if (!trimmedPath) return fallbackUrl;

  const now = Date.now();
  const cached = cache.get(trimmedPath);
  if (cached && cached.expiresAtMs - REFRESH_BUFFER_MS > now) {
    return cached.signedUrl;
  }

  const pending = inFlight.get(trimmedPath);
  if (pending) return pending;

  const request = (async (): Promise<string> => {
    const res = await sign(trimmedPath);
    if (!res.ok) return fallbackUrl;

    cache.set(trimmedPath, {
      signedUrl: res.signedUrl,
      expiresAtMs: now + expiresInSeconds * 1000,
    });
    return res.signedUrl;
  })();

  inFlight.set(trimmedPath, request);

  try {
    return await request;
  } finally {
    if (inFlight.get(trimmedPath) === request) {
      inFlight.delete(trimmedPath);
    }
  }
}
