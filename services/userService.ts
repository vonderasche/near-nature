import { supabase } from '@/lib/supabase';

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type UpdateUserPayload = Partial<Pick<User, 'full_name' | 'avatar_url'>>;

// Fetch the current user's profile
export async function getUser(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

// Update the current user's profile
export async function updateUser(
  userId: string,
  payload: UpdateUserPayload
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete the current user's account (cascades via DB)
export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) throw error;
}