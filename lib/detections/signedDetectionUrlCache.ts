import type { CreateDetectionsSignedUrlResult } from '@/lib/detections/detectionsStorage';
import {
  loadPersistedSignedUrl,
  persistSignedUrl,
  clearPersistedSignedUrls,
} from '@/lib/detections/signedDetectionUrlPersistentCache';

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

/** Clears in-memory signed URL cache (safe in unit tests). */
export function clearSignedDetectionUrlCache(): void {
  cache.clear();
  inFlight.clear();
}

/** Clears memory + AsyncStorage signed URLs (e.g. sign-out). */
export async function clearAllSignedDetectionUrlCaches(): Promise<void> {
  clearSignedDetectionUrlCache();
  await clearPersistedSignedUrls();
}

/** Seed memory cache from a prior disk read (e.g. batch hydrate). */
export function seedSignedDetectionUrlCache(
  objectPath: string,
  signedUrl: string,
  expiresAtMs: number,
): void {
  const trimmed = objectPath.trim();
  if (!trimmed) return;
  cache.set(trimmed, { signedUrl, expiresAtMs });
}

/**
 * Returns a signed display URL for a detections bucket object path.
 * Memory cache → AsyncStorage → sign. Persists successful signs to disk.
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

  let pending = inFlight.get(trimmedPath);
  if (pending) return pending;

  let resolvePending!: (url: string) => void;
  pending = new Promise<string>((resolve) => {
    resolvePending = resolve;
  });
  inFlight.set(trimmedPath, pending);

  void (async () => {
    try {
      const persisted = await loadPersistedSignedUrl(trimmedPath);
      if (persisted) {
        const expiresAtMs = Date.now() + expiresInSeconds * 1000;
        cache.set(trimmedPath, { signedUrl: persisted, expiresAtMs });
        resolvePending(persisted);
        return;
      }

      const res = await sign(trimmedPath);
      if (!res.ok) {
        resolvePending(fallbackUrl);
        return;
      }

      const expiresAtMs = Date.now() + expiresInSeconds * 1000;
      cache.set(trimmedPath, {
        signedUrl: res.signedUrl,
        expiresAtMs,
      });
      await persistSignedUrl(trimmedPath, res.signedUrl, expiresAtMs);
      resolvePending(res.signedUrl);
    } catch {
      resolvePending(fallbackUrl);
    } finally {
      if (inFlight.get(trimmedPath) === pending) {
        inFlight.delete(trimmedPath);
      }
    }
  })();

  return pending;
}
