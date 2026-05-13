import { supabase } from '@/lib/supabase';

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

// Delete the current user's account (cascades via DB)
export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) throw error;
}