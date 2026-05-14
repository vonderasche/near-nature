import { deleteAsync, getInfoAsync } from '@/lib/fs/legacyFileSystem';
import { manipulateAsync, SaveFormat, type ImageResult } from 'expo-image-manipulator';

export type ResizeImageForUploadOptions = {
  /** Initial cap on the longest edge in pixels (default 2048). */
  maxEdge?: number;
  /** Target maximum JPEG file size on disk in bytes (default ~4.5 MiB, under Claude’s ~5 MiB image limit). */
  maxBytes?: number;
  /** JPEG quality 0–1 (default 0.82). Reduced automatically if still too large. */
  compress?: number;
};

const DEFAULT_MAX_EDGE = 2048;
/** Stay under Anthropic’s 5 MiB limit with margin (binary JPEG size ≈ decoded size for that limit). */
const DEFAULT_MAX_BYTES = Math.floor(4.5 * 1024 * 1024);
const DEFAULT_COMPRESS = 0.82;

const MIN_EDGE = 480;
const MAX_ATTEMPTS = 16;

async function getDimensions(uri: string): Promise<{ width: number; height: number }> {
  const r = await manipulateAsync(uri, []);
  return { width: r.width, height: r.height };
}

/**
 * Resizes and recompresses a local image so API uploads stay within typical vision limits (e.g. Claude ~5 MiB).
 * Iteratively shrinks dimensions and/or quality until the JPEG is under `maxBytes`.
 */
export async function resizeImageForUpload(
  sourceUri: string,
  options: ResizeImageForUploadOptions = {}
): Promise<ImageResult> {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const initialCap = options.maxEdge ?? DEFAULT_MAX_EDGE;
  let compress = options.compress ?? DEFAULT_COMPRESS;

  const { width: w, height: h } = await getDimensions(sourceUri);
  const long = Math.max(w, h);

  /** Longest edge of output (pixels); shrinks until file fits or floor reached. */
  let targetLong = Math.min(long, initialCap);

  let previousUri: string | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const scale = targetLong / long;
    const rw = Math.max(1, Math.round(w * scale));
    const rh = Math.max(1, Math.round(h * scale));

    const resizeAction =
      w >= h ? { resize: { width: rw } } : { resize: { height: rh } };

    const result = await manipulateAsync(sourceUri, [resizeAction], {
      compress,
      format: SaveFormat.JPEG,
    });

    if (previousUri && previousUri !== sourceUri && previousUri !== result.uri) {
      await deleteAsync(previousUri, { idempotent: true }).catch(() => {});
    }
    previousUri = result.uri;

    const info = await getInfoAsync(result.uri);
    const size = info.exists ? info.size : 0;

    if (size <= maxBytes || targetLong <= MIN_EDGE) {
      return result;
    }

    targetLong = Math.max(MIN_EDGE, Math.floor(targetLong * 0.85));
    compress = Math.max(0.45, compress * 0.92);
  }

  if (previousUri && previousUri !== sourceUri) {
    await deleteAsync(previousUri, { idempotent: true }).catch(() => {});
  }
  throw new Error('Could not shrink image below the size limit.');
}
