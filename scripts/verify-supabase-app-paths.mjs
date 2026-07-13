/**
 * Exercises Supabase calls used by the Explorer Board.
 * Usage: node scripts/verify-supabase-app-paths.mjs
 */
import { createClient } from '@supabase/supabase-js';

import { loadProjectEnv } from './loadSupabaseSeedEnv.mjs';

const env = loadProjectEnv();
const supabase = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

console.log('\nApp-path verify (Explorer Board)\n');

const pageSize = 20;
const { data: lbRaw, error: lbErr } = await supabase.rpc('get_detection_count_leaderboard', {
  p_limit: pageSize + 1,
  p_offset: 0,
});
if (lbErr) throw lbErr;
const raw = Array.isArray(lbRaw) ? lbRaw : [];
const hasMore = raw.length > pageSize;
const page = hasMore ? raw.slice(0, pageSize) : raw;
const rows = page.map((r) => ({
  rank: Number(r.leaderboard_rank),
  username: r.username,
  motto: r.motto ?? null,
  totalPoints: Number(r.total_points ?? 0),
  nativeCount: Number(r.native_species_count ?? 0),
}));
console.log(`  Explorer Board page: ${rows.length} rows, hasMore=${hasMore}`);
if (rows[0]) {
  console.log(
    `  #1: ${rows[0].username} — ${rows[0].totalPoints} pts, motto=${rows[0].motto ? 'yes' : 'null'}`,
  );
}

if (rows.length < 1) {
  console.log('\n  WARN Explorer Board empty (expected on a fresh DB — sign up and save detections to populate it)');
  console.log('\nApp paths OK — Explorer Board RPC works; no rows yet.\n');
  process.exit(0);
}
console.log('\nApp paths OK — Explorer Board data loads correctly.\n');
