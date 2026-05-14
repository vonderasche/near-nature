/** First value when Expo Router passes a string or string[] for one query key. */
export function paramToString(v: string | string[] | undefined): string | undefined {
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

/** `decodeURIComponent` for nav params; returns `raw` if decoding throws. */
export function normalizePhotoUri(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
