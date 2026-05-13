import { FunctionsHttpError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

async function readEdgeFunctionErrorMessage(error: unknown): Promise<string | null> {
  if (error instanceof FunctionsHttpError) {
    const res = error.context as Response | undefined;
    if (res) {
      try {
        const body = (await res.clone().json()) as { error?: string };
        if (body?.error) return body.error;
      } catch {
        try {
          const text = await res.clone().text();
          return text || null;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

/** Row shape for `public.users` (see `sql/create_user.sql`). */
export type User = {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  motto: string | null;
  avatar_url: string | null;
  state: string | null;
  created_at: string;
  updated_at: string;
};

export type UpdateUserPayload = Partial<
  Pick<User, 'username' | 'first_name' | 'last_name' | 'motto' | 'avatar_url' | 'state'>
>;

// Fetch the current user's profile
export async function getUser(userId: string): Promise<User | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();

  if (error) throw error;
  return data as User | null;
}

// Update the current user's profile (RLS: own row only)
export async function updateUser(userId: string, payload: UpdateUserPayload): Promise<User> {
  const { data, error } = await supabase.from('users').update(payload).eq('id', userId).select().single();

  if (error) throw error;
  return data as User;
}

/**
 * Permanently deletes the authenticated user via the `delete-account` Edge Function
 * (service role). `public.users` is removed by FK cascade when `auth.users` is deleted.
 */
export async function deleteAccount(): Promise<void> {
  const { data, error } = await supabase.functions.invoke<{ ok?: boolean; error?: string }>('delete-account', {
    body: {},
  });

  if (error) {
    const detail = await readEdgeFunctionErrorMessage(error);
    throw new Error(detail ?? error.message);
  }
  if (data && typeof data === 'object' && 'error' in data && data.error) {
    throw new Error(String(data.error));
  }
}