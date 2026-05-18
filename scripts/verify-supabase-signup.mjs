/**
 * Probes sign-up RPCs on the linked Supabase project (from .env).
 * Usage: node scripts/verify-supabase-signup.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const text = readFileSync(resolve(root, '.env'), 'utf8');
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return env;
}

function isRpcMissing(error) {
  const msg = (error?.message ?? '').toLowerCase();
  return (
    msg.includes('could not find the function') ||
    msg.includes('does not exist') ||
    msg.includes('schema cache')
  );
}

/** Unauthenticated probe: RPC exists if we get auth/permission errors, not "function not found". */
function isEnsureProfileProbeOk(error) {
  const msg = (error?.message ?? '').toLowerCase();
  if (isRpcMissing(error)) return false;
  if (msg.includes('not authenticated')) return true;
  if (msg.includes('permission denied')) return true;
  return false;
}

const env = loadEnv();
const supabase = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

console.log('\nSign-up RPC verify\n');

const probeEmail = `probe-${Date.now()}@example.invalid`;
const { error: emailErr } = await supabase.rpc('check_email_exists', { p_email: probeEmail });
if (emailErr) {
  if (isRpcMissing(emailErr)) {
    console.error('  FAIL check_email_exists — run sql/check_user_exists.sql');
    process.exit(1);
  }
  throw emailErr;
}
console.log('  OK   check_email_exists');

const { error: userErr } = await supabase.rpc('check_username_exists', {
  p_username: `probe_${Date.now()}`,
});
if (userErr) {
  if (isRpcMissing(userErr)) {
    console.error('  FAIL check_username_exists — run sql/check_user_exists.sql');
    process.exit(1);
  }
  throw userErr;
}
console.log('  OK   check_username_exists');

const { data: dobCol, error: dobErr } = await supabase.from('users').select('date_of_birth').limit(0);
if (dobErr) {
  const msg = (dobErr.message ?? '').toLowerCase();
  if (msg.includes('date_of_birth') || msg.includes('column')) {
    console.error('  FAIL public.users.date_of_birth — run sql/add_user_date_of_birth.sql or create_user.sql');
    process.exit(1);
  }
  if (!msg.includes('permission') && !msg.includes('row-level')) {
    throw dobErr;
  }
}
console.log('  OK   public.users.date_of_birth column');

const { error: profileErr } = await supabase.rpc('ensure_public_user_profile');
if (profileErr) {
  if (isRpcMissing(profileErr)) {
    console.error('  FAIL ensure_public_user_profile — run sql/ensure_public_user_profile.sql');
    process.exit(1);
  }
  if (!isEnsureProfileProbeOk(profileErr)) {
    throw profileErr;
  }
}
console.log('  OK   ensure_public_user_profile');

console.log('\nSign-up database paths OK.\n');
