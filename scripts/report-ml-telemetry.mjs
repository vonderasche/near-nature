/**
 * Prints ML telemetry report summaries from Supabase views.
 * Usage: npm run report:ml-telemetry
 *
 * Requires .env with EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * (service role reads all users' telemetry for admin review).
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

function isMissingRelation(error) {
  const msg = (error?.message ?? '').toLowerCase();
  return msg.includes('does not exist') || msg.includes('schema cache') || error?.code === 'PGRST205';
}

function printSection(title, rows) {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
  if (!rows?.length) {
    console.log('  (no rows)');
    return;
  }
  for (const row of rows) {
    console.log(' ', JSON.stringify(row));
  }
}

const env = loadEnv();
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL in .env');
  process.exit(1);
}

if (!serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env (needed to read telemetry views).');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log('\nML telemetry report (last 30 days)\n');

const { data: refreshCount, error: refreshError } = await supabase.rpc(
  'refresh_ml_telemetry_daily_rollups',
  { p_days: 30 },
);
if (refreshError && !isMissingRelation(refreshError)) {
  console.warn(`  Rollup refresh note: ${refreshError.message}`);
} else if (typeof refreshCount === 'number') {
  console.log(`  Refreshed daily rollups: ${refreshCount} row(s)`);
}

const { data: flags, error: flagsError } = await supabase
  .from('ml_telemetry_flag_counts_30d')
  .select('domain, event_name, pipeline, region_id, flag, event_count')
  .order('event_count', { ascending: false })
  .limit(15);

if (flagsError) {
  if (isMissingRelation(flagsError)) {
    console.error('Missing views — run sql/ml_telemetry_reports.sql in Supabase Studio.');
    process.exit(1);
  }
  throw flagsError;
}

printSection('Top flags (30d)', flags);

const { data: routing, error: routingError } = await supabase
  .from('ml_telemetry_routing_misses_30d')
  .select('routing_label, region_id, empty_count, no_organism_count, total_events, avg_top_confidence')
  .order('empty_count', { ascending: false })
  .limit(10);

if (routingError) throw routingError;
printSection('Routing misses', routing);

const { data: reclassify, error: reclassifyError } = await supabase
  .from('ml_telemetry_reclassify_rate_30d')
  .select('region_id, session_count, reclassified_sessions, reclassify_pct')
  .order('reclassify_pct', { ascending: false });

if (reclassifyError) throw reclassifyError;
printSection('Reclassify rate by region', reclassify);

const { data: mismatches, error: mismatchError } = await supabase
  .from('ml_telemetry_reclassify_mismatches_30d')
  .select('created_at, region_id, routing_label, tflite_top_genus, cloud_top_latin')
  .limit(10);

if (mismatchError) throw mismatchError;
printSection('Recent reclassify mismatches', mismatches);

console.log('\nDone.\n');
