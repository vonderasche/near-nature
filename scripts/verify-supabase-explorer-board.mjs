/**
 * Probes the linked Supabase project (from .env) for Explorer board RPC.
 * Usage: node scripts/verify-supabase-explorer-board.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const path = resolve(root, '.env');
  const text = readFileSync(path, 'utf8');
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return env;
}

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

const env = loadEnv();
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, anonKey);
let exitCode = 0;

console.log(`\nSupabase verify — ${url}\n`);
console.log('Explorer board');

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

console.log(exitCode === 0 ? '\nExplorer board checks passed.\n' : '\nExplorer board checks failed.\n');
process.exit(exitCode);
