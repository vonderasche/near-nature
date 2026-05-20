/**
 * Probes profile scoring / badge RPCs on the linked Supabase project (from .env).
 * Usage: node scripts/verify-supabase-scoring.mjs
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
    msg.includes('schema cache') ||
    error?.code === 'PGRST202'
  );
}

const env = loadEnv();
const supabase = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
const probeUserId = '00000000-0000-4000-8000-000000000099';

console.log('\nScoring & badges RPC verify\n');

let failed = false;

async function probe(name, fn) {
  try {
    await fn();
    console.log(`  OK ${name}`);
  } catch (e) {
    failed = true;
    console.error(`  FAIL ${name} — ${e instanceof Error ? e.message : e}`);
  }
}

await probe('get_public_user_awards', async () => {
  const { data, error } = await supabase.rpc('get_public_user_awards', { p_user_id: probeUserId });
  if (error) {
    if (isRpcMissing(error)) {
      throw new Error('run sql/get_public_user_awards.sql and reload schema cache');
    }
    throw error;
  }
  if (!Array.isArray(data)) throw new Error('expected row array');
});

await probe('get_user_scoring_snapshot', async () => {
  const { data, error } = await supabase.rpc('get_user_scoring_snapshot', {
    p_user_id: probeUserId,
  });
  if (error) {
    if (isRpcMissing(error)) {
      throw new Error('run sql/get_user_scoring_snapshot.sql and reload schema cache');
    }
    throw error;
  }
  if (data !== null) {
    console.log('    (unauthenticated probe returned data — expected null)');
  }
});

await probe('get_user_score_by_category', async () => {
  const { data, error } = await supabase.rpc('get_user_score_by_category', {
    p_user_id: probeUserId,
  });
  if (error) {
    if (isRpcMissing(error)) {
      throw new Error('run sql/get_user_score_by_category.sql and reload schema cache');
    }
    throw error;
  }
  if (data != null && !Array.isArray(data)) throw new Error('expected array or null');
});

if (failed) {
  console.error('\nScoring RPC verify FAILED\n');
  process.exit(1);
}

console.log('\nScoring RPC verify OK\n');
