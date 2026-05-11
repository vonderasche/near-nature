/**
 * Supabase implicit / magic-link URLs often put tokens in the fragment:
 * `myapp://path#access_token=...&refresh_token=...&type=recovery`
 */
export function parseSupabaseAuthParamsFromUrl(url: string): Record<string, string> | null {
  const hashIdx = url.indexOf('#');
  const fragment = hashIdx >= 0 ? url.slice(hashIdx + 1) : '';
  const search =
    hashIdx >= 0
      ? fragment
      : url.includes('?')
        ? url.split('?').slice(1).join('?')
        : '';

  if (!search) return null;

  const params = new URLSearchParams(search);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (!access_token || !refresh_token) return null;

  const out: Record<string, string> = {};
  params.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}
