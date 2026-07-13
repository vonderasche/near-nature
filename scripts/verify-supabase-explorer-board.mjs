/**
 * Probes the linked Supabase project (from .env) for Explorer Board RPC.
 * Usage: node scripts/verify-supabase-explorer-board.mjs
 */
import { createClient } from '@supabase/supabase-js';

import { loadProjectEnv } from './loadSupabaseSeedEnv.mjs';

function ok(label, detail = '') {
  console.log(`  OK   ${label}${detail ? `: ${detail}` : ''}`);
}

function fail(label, detail = '') {
  console.log(`  FAIL ${label}${detail ? `: ${detail}` : ''}`);
}

function isRpcMissing(error) {
  const msg = (error?.message ?? '').toLowerCase();
  return (
    msg.includes('could not find the function') ||
    msg.includes('does not exist') ||
    msg.includes('schema cache')
  );
}

const env = loadProjectEnv();
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, anonKey);
let exitCode = 0;

console.log(`\nSupabase verify — ${url}\n`);
console.log('Explorer Board');

const { error: lbErr } = await supabase.rpc('get_detection_count_leaderboard', {
  p_limit: 1,
  p_offset: 0,
});

if (lbErr) {
  if (isRpcMissing(lbErr)) {
    fail('get_detection_count_leaderboard(int,int)', 'run sql/get_detection_count_leaderboard.sql');
    exitCode = 1;
  } else if (
    lbErr.message?.includes('JWT') ||
    lbErr.code === 'PGRST301' ||
    lbErr.message?.toLowerCase().includes('not authorized')
  ) {
    ok('get_detection_count_leaderboard', 'RPC exists (auth required — expected for anon)');
  } else {
    fail('get_detection_count_leaderboard', lbErr.message);
    exitCode = 1;
  }
} else {
  ok('get_detection_count_leaderboard', 'RPC callable');
}

console.log(exitCode === 0 ? '\nExplorer Board checks passed.\n' : '\nExplorer Board checks failed.\n');
process.exit(exitCode);
