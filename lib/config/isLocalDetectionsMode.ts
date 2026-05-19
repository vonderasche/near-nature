/** When true, camera saves and gallery/scoring read from on-device storage only (no Supabase writes). */
export function isLocalDetectionsMode(): boolean {
  const raw = process.env.EXPO_PUBLIC_LOCAL_DETECTIONS?.trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}
