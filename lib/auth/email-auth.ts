import { mapSupabaseAuthErrorMessage } from '@/lib/auth/mapSupabaseAuthError';
import { supabase } from '@/lib/supabase';

export type EmailAuthResult =
  | { ok: true; needsEmailConfirmation?: boolean }
  | { ok: false; message: string };

function validateEmailShape(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length > 3 && trimmed.includes('@');
}

function mapAuthMessage(message: string): string {
  const mapped = mapSupabaseAuthErrorMessage(message);
  if (mapped !== message) return mapped;

  const m = message.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid_credentials')) {
    return 'Invalid email or password.';
  }
  if (
    m.includes('user already registered') ||
    m.includes('already been registered') ||
    m.includes('already registered') ||
    m.includes('email address is already') ||
    m.includes('user already exists')
  ) {
    return 'An account with this email already exists. Use Log in, or delete the user under Supabase → Authentication → Users if you are resetting a dev project.';
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

export type SignUpProfile = {
  username: string;
  first_name: string;
  last_name: string;
  motto: string;
};

export async function signUpWithEmail(
  email: string,
  password: string,
  profile: SignUpProfile
): Promise<EmailAuthResult> {
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

  const username = profile.username.trim();
  const first_name = profile.first_name.trim();
  const last_name = profile.last_name.trim();
  const motto = profile.motto.trim();
  if (!username) {
    return { ok: false, message: 'Username is required.' };
  }
  if (!first_name || !last_name) {
    return { ok: false, message: 'First and last name are required.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email: e,
    password,
    options: {
      data: {
        username,
        first_name,
        last_name,
        motto,
      },
    },
  });
  if (error) {
    return { ok: false, message: mapAuthMessage(error.message) };
  }

  // Duplicate email / blocked sign-up: GoTrue often returns no error but no user (anti-enumeration),
  // or a user with no identities and no session — do not treat as "check your email".
  const user = data.user;
  if (!user) {
    return {
      ok: false,
      message:
        'No new account was created. This email is probably already registered in Supabase Auth (Dashboard → Authentication → Users), even if public.users is empty. Try Log in, or delete that auth user first.',
    };
  }

  const identities = user.identities ?? [];
  if (!data.session && identities.length === 0) {
    return {
      ok: false,
      message:
        'Sign-up did not complete (no session). This often means the email is already registered. Use Log in, or remove the user under Authentication → Users to test a fresh sign-up.',
    };
  }

  // If confirmations are enabled in Supabase, session is null until the user verifies email.
  if (!data.session) {
    return { ok: true, needsEmailConfirmation: true };
  }
  return { ok: true };
}
