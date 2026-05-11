import { supabase } from '@/lib/supabase';

export type EmailAuthResult =
  | { ok: true; needsEmailConfirmation?: boolean }
  | { ok: false; message: string };

function validateEmailShape(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length > 3 && trimmed.includes('@');
}

function mapAuthMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid_credentials')) {
    return 'Invalid email or password.';
  }
  if (m.includes('user already registered') || m.includes('already been registered')) {
    return 'An account with this email already exists.';
  }
  if (m.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.';
  }
  return message;
}

export async function signInWithEmail(email: string, password: string): Promise<EmailAuthResult> {
  const e = email.trim();
  if (!e || !password) {
    return { ok: false, message: 'Email and password are required.' };
  }
  if (!validateEmailShape(e)) {
    return { ok: false, message: 'Enter a valid email address.' };
  }

  const { error } = await supabase.auth.signInWithPassword({ email: e, password });
  if (error) {
    return { ok: false, message: mapAuthMessage(error.message) };
  }
  return { ok: true };
}

export async function signUpWithEmail(email: string, password: string): Promise<EmailAuthResult> {
  const e = email.trim();
  if (!e || !password) {
    return { ok: false, message: 'Email and password are required.' };
  }
  if (!validateEmailShape(e)) {
    return { ok: false, message: 'Enter a valid email address.' };
  }
  if (password.length < 8) {
    return { ok: false, message: 'Password must be at least 8 characters.' };
  }

  const { data, error } = await supabase.auth.signUp({ email: e, password });
  if (error) {
    return { ok: false, message: mapAuthMessage(error.message) };
  }

  // If confirmations are enabled in Supabase, session is null until the user verifies email.
  if (!data.session) {
    return { ok: true, needsEmailConfirmation: true };
  }
  return { ok: true };
}
