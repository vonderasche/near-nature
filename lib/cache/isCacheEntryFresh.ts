/** True when `cachedAt` is within `maxAgeMs` of `now` (default Date.now()). */
export function isCacheEntryFresh(
  cachedAt: number,
  maxAgeMs: number,
  now = Date.now(),
): boolean {
  if (!Number.isFinite(cachedAt) || cachedAt <= 0) return false;
  return now - cachedAt <= maxAgeMs;
}
