const STALE_REFRESH_MARKERS = ['invalid refresh token', 'refresh token not found', 'refresh token already used'];

export function looksLikeStaleStoredRefresh(error: unknown): boolean {
  const msg =
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
      ? (error as { message: string }).message.toLowerCase()
      : '';
  if (!msg) return false;
  return STALE_REFRESH_MARKERS.some((m) => msg.includes(m));
}
