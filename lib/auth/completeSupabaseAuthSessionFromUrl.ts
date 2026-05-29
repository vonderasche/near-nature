import { parseSupabaseAuthParamsFromUrl } from '@/lib/auth/parseAuthCallbackUrl';
import { supabase } from '@/lib/supabase';

function searchParamsFromUrl(url: string): URLSearchParams {
  const hashIdx = url.indexOf('#');
  const search =
    hashIdx >= 0
      ? url.slice(hashIdx + 1)
      : url.includes('?')
        ? url.split('?').slice(1).join('?')
        : '';
  return new URLSearchParams(search);
}

export async function completeSupabaseAuthSessionFromUrl(url: string) {
  const params = parseSupabaseAuthParamsFromUrl(url);
  if (params) {
    const { data, error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    return { data, error, type: params.type ?? null };
  }

  const code = searchParamsFromUrl(url).get('code');
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    return { data, error, type: null };
  }

  return { data: { session: null, user: null }, error: null, type: null };
}
