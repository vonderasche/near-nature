import { isEmailReadyForAvailabilityCheck } from '@/lib/auth/validateSignupEmail';
import { isUsernameReadyForAvailabilityCheck } from '@/lib/auth/validateUsername';
import { supabase } from '@/lib/supabase';

export { isEmailReadyForAvailabilityCheck, isUsernameReadyForAvailabilityCheck };

export async function isEmailAlreadyRegistered(email: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_email_exists', { p_email: email.trim() });
  if (error) throw error;
  return Boolean(data);
}

export async function isUsernameAlreadyTaken(username: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_username_exists', { p_username: username.trim() });
  if (error) throw error;
  return Boolean(data);
}
