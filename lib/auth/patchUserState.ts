import { normalizeUsStateCode } from '@/constants/us-states';
import { supabase } from '@/lib/supabase';

/** Writes `public.users.state` for the signed-in user (e.g. after Google sign-up). */
export async function patchUserStateForCurrentUser(stateCode: string): Promise<void> {
  const code = normalizeUsStateCode(stateCode);
  if (!code) return;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return;

  await supabase.from('users').update({ state: code }).eq('id', userId);
}
