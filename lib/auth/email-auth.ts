import { LEGAL_TERMS_VERSION } from '@/constants/legal';

import { mapSupabaseAuthErrorMessage } from '@/lib/auth/mapSupabaseAuthError';

import { MIN_SIGNUP_PASSWORD_LENGTH, validateSignupPassword } from '@/lib/auth/signupPassword';

import { validateBirthDateIso } from '@/lib/auth/validateBirthDate';

import { validateSignupEmail } from '@/lib/auth/validateSignupEmail';

import { validateUsername } from '@/lib/auth/validateUsername';

import { supabase } from '@/lib/supabase';



export type EmailAuthResult =

  | { ok: true; needsEmailConfirmation?: boolean }

  | { ok: false; message: string };



function mapAuthMessage(message: string): string {

  const mapped = mapSupabaseAuthErrorMessage(message);

  if (mapped !== message) return mapped;



  const m = message.toLowerCase();

  if (m.includes('invalid login credentials') || m.includes('invalid_credentials')) {

    return 'Invalid email, username, or password.';

  }

  if (

    m.includes('user already registered') ||

    m.includes('already been registered') ||

    m.includes('already registered') ||

    m.includes('email address is already') ||

    m.includes('user already exists')

  ) {

    return 'An account with this email already exists. Use Log in — we will create your profile if it is missing. To test a fresh sign-up in dev, delete the user under Supabase → Authentication → Users.';

  }

  if (m.includes('email not confirmed')) {

    return 'Please confirm your email before signing in.';

  }

  return message;

}



/**

 * Sign in with either the account email or `public.users.username` (requires RPC

 * `resolve_login_email` — see `sql/resolve_login_email.sql`).

 */

export async function signInWithEmail(emailOrUsername: string, password: string): Promise<EmailAuthResult> {

  const trimmed = emailOrUsername.trim();

  if (!trimmed || !password) {

    return { ok: false, message: 'Email or username and password are required.' };

  }



  let emailForAuth: string;

  if (trimmed.includes('@')) {

    const emailCheck = validateSignupEmail(trimmed);

    if (!emailCheck.ok) {

      return { ok: false, message: emailCheck.message };

    }

    emailForAuth = trimmed;

  } else {

    if (trimmed.length < 2) {

      return { ok: false, message: 'Enter a valid username.' };

    }

    const { data, error } = await supabase.rpc('resolve_login_email', { p_identifier: trimmed });

    if (error) {

      return { ok: false, message: mapSupabaseAuthErrorMessage(error.message) };

    }

    const resolved = typeof data === 'string' ? data.trim() : '';

    if (!resolved) {

      return { ok: false, message: 'Invalid email, username, or password.' };

    }

    emailForAuth = resolved;

  }



  const { error } = await supabase.auth.signInWithPassword({ email: emailForAuth, password });

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

  /** Two-letter US state code (e.g. `VA`). */

  state: string;

  /** ISO date `YYYY-MM-DD`. */

  date_of_birth: string;

  marketing_opt_in?: boolean;

};



export type SignUpOptions = {

  termsAccepted: boolean;

};



export async function signUpWithEmail(

  email: string,

  password: string,

  profile: SignUpProfile,

  options: SignUpOptions,

): Promise<EmailAuthResult> {

  const e = email.trim();

  if (!e || !password) {

    return { ok: false, message: 'Email and password are required.' };

  }



  const emailCheck = validateSignupEmail(e);

  if (!emailCheck.ok) {

    return { ok: false, message: emailCheck.message };

  }



  const passwordCheck = validateSignupPassword(password);

  if (!passwordCheck.ok) {

    return { ok: false, message: passwordCheck.message };

  }



  if (!options.termsAccepted) {

    return { ok: false, message: 'Accept the Terms of Service and Privacy Policy to continue.' };

  }



  const username = profile.username.trim();

  const first_name = profile.first_name.trim();

  const last_name = profile.last_name.trim();

  const motto = profile.motto.trim();

  const state = profile.state.trim().toUpperCase();

  const usernameRules = validateUsername(username);

  if (!usernameRules.ok) {

    return { ok: false, message: usernameRules.message };

  }

  if (!first_name || !last_name) {

    return { ok: false, message: 'First and last name are required.' };

  }

  if (!state || state.length !== 2) {

    return { ok: false, message: 'Select your US home state.' };

  }



  const dobCheck = validateBirthDateIso(profile.date_of_birth);

  if (!dobCheck.ok) {

    return { ok: false, message: dobCheck.message };

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

        state,

        date_of_birth: dobCheck.isoDate,

        marketing_opt_in: Boolean(profile.marketing_opt_in),

        terms_accepted_version: LEGAL_TERMS_VERSION,

        terms_accepted_at: new Date().toISOString(),

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

        'No new account was created. This email is probably already registered. Use Log in — we will finish setting up your profile if needed.',

    };

  }



  const identities = user.identities ?? [];

  if (!data.session && identities.length === 0) {

    return {

      ok: false,

      message:

        'Sign-up did not complete (no session). This email is likely already registered — use Log in instead. If you are testing in dev, remove the user under Authentication → Users first.',

    };

  }



  // If confirmations are enabled in Supabase, session is null until the user verifies email.

  if (!data.session) {

    return { ok: true, needsEmailConfirmation: true };

  }

  return { ok: true };

}



export { MIN_SIGNUP_PASSWORD_LENGTH };

