/**
 * Probes the linked Supabase project (from .env) for Discover + Explorer Board RPCs/data.
 * Usage: node scripts/verify-supabase-discover-leaderboard.mjs
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

function warn(label, detail = '') {
  console.log(`  WARN ${label}${detail ? `: ${detail}` : ''}`);
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
const STATE = 'Florida';
let exitCode = 0;

console.log(`\nSupabase verify — ${url}\n`);

// --- Discover (guest / anon) ---
console.log('Discover (anon)');

const { count: speciesCount, error: speciesErr } = await supabase
  .from('explore_species')
  .select('id', { count: 'exact', head: true })
  .eq('state', STATE);

if (speciesErr) {
  fail('explore_species table', speciesErr.message);
  exitCode = 1;
} else if ((speciesCount ?? 0) === 0) {
  warn('explore_species', `0 rows for state=${STATE} — run discover/seed/florida_data.sql + discover/seed_florida_discover_all.sql`);
  exitCode = 1;
} else {
  ok('explore_species', `${speciesCount} rows (${STATE})`);
}

const { data: featured, error: featuredErr } = await supabase.rpc('get_featured_species');
if (featuredErr) {
  if (isRpcMissing(featuredErr)) {
    fail('get_featured_species RPC', 'deploy discover/create_featured_rotation.sql + discover/explore_app_grants.sql');
    exitCode = 1;
  } else {
    fail('get_featured_species', featuredErr.message);
    exitCode = 1;
  }
} else {
  const n = Array.isArray(featured) ? featured.length : 0;
  if (n === 0) warn('get_featured_species', '0 featured — run florida seed / rotate_featured');
  else ok('get_featured_species', `${n} featured`);
}

const { count: parkCount, error: parksErr } = await supabase
  .from('parks_with_counts')
  .select('id', { count: 'exact', head: true })
  .eq('state', STATE);

if (parksErr) {
  fail('parks_with_counts view', parksErr.message);
  exitCode = 1;
} else if ((parkCount ?? 0) === 0) {
  warn('parks_with_counts', `0 parks for ${STATE}`);
  exitCode = 1;
} else {
  ok('parks_with_counts', `${parkCount} parks (${STATE})`);
}

const { data: summary, error: summaryErr } = await supabase.rpc('get_park_summary_for_state', {
  p_state: STATE,
});
if (summaryErr) {
  if (isRpcMissing(summaryErr)) {
    warn(
      'get_park_summary_for_state',
      'RPC missing — hub uses park list fallback; run sql/discover/get_park_summary_for_state.sql',
    );
  } else if (summaryErr.message?.includes('permission') || summaryErr.code === '42501') {
    warn('get_park_summary_for_state', 'anon denied (authenticated only) — OK for signed-in users');
  } else {
    fail('get_park_summary_for_state', summaryErr.message);
    exitCode = 1;
  }
} else {
  const row = Array.isArray(summary) ? summary[0] : null;
  ok(
    'get_park_summary_for_state',
    `parks=${row?.park_count ?? 0}, sightings=${row?.species_sightings ?? 0}`,
  );
}

// --- Leaderboard RPC presence (requires auth for data) ---
console.log('\nExplorer Board');

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
  ok('get_detection_count_leaderboard', 'callable without auth (unexpected but OK)');
}

// Legacy no-arg overload should not be required
const { error: legacyErr } = await supabase.rpc('get_detection_count_leaderboard', {});
if (legacyErr && isRpcMissing(legacyErr)) {
  ok('legacy get_detection_count_leaderboard()', 'dropped (app uses paginated RPC)');
} else if (!legacyErr) {
  warn('legacy get_detection_count_leaderboard()', 'still present — app prefers (int,int) overload');
}

console.log(exitCode === 0 ? '\nAll critical checks passed.\n' : '\nSome checks failed — run missing SQL in Supabase SQL Editor.\n');
process.exit(exitCode);
