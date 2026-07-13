/**
 * Verifies ML telemetry RPCs exist (requires signed-in user for insert test).
 * Usage: node scripts/verify-supabase-ml-telemetry.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

import { loadProjectEnv } from './loadSupabaseSeedEnv.mjs';

const env = loadProjectEnv();
const supabase = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

console.log('\nML telemetry verify\n');

const sessionId = randomUUID();
const { data: insertCount, error: insertError } = await supabase.rpc('insert_ml_telemetry_events', {
  p_events: [
    {
      session_id: sessionId,
      domain: 'classification',
      event_name: 'capture_identify',
      pipeline: 'tflite',
      outcome: 'empty',
      region_id: 'southeast',
      platform: 'verify-script',
      app_version: '0.0.0',
      flags: ['empty_result'],
      payload: { routing_label: 'No Plant or Animal', top_predictions: [] },
    },
  ],
});

if (insertError) {
  if (insertError.code === 'PGRST202' || /does not exist/i.test(insertError.message ?? '')) {
    console.error('  Missing RPC/table — run sql/create_ml_telemetry_events.sql in Supabase Studio.');
    process.exit(1);
  }
  if (insertError.message?.includes('Not authenticated')) {
    console.log('  RPC exists; insert skipped (not signed in — expected for anon verify).');
    process.exit(0);
  }
  throw insertError;
}

console.log(`  insert_ml_telemetry_events: ${insertCount} row(s)`);

const { data: flags, error: viewError } = await supabase
  .from('ml_telemetry_flag_counts_30d')
  .select('flag, event_count')
  .limit(5);

if (viewError) {
  if (/does not exist/i.test(viewError.message ?? '')) {
    console.error('  Missing views — run sql/ml_telemetry_reports.sql');
    process.exit(1);
  }
  console.log(`  Views note: ${viewError.message}`);
} else {
  console.log(`  ml_telemetry_flag_counts_30d sample: ${flags?.length ?? 0} rows`);
}

console.log('\nOK\n');
