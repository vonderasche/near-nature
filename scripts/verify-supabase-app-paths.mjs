/**
 * Exercises the same Supabase calls the app uses (Discover hub + Explorer Board).
 * Usage: node scripts/verify-supabase-app-paths.mjs
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

const EXPLORE_SPECIES_SELECT =
  'id, inaturalist_id, latin_name, common_name, type, iconic_taxon_name, observations_count, rank, state, wikipedia_url, image_url, wiki_summary, wiki_image_url, is_featured, bonus_points';

const env = loadEnv();
const supabase = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
const STATE = 'Florida';

function mapSpecies(row) {
  return {
    id: row.id,
    commonName: row.common_name,
    type: row.type,
    isFeatured: Boolean(row.is_featured),
    bonusPoints: Number(row.bonus_points ?? 0),
  };
}

console.log('\nApp-path verify (Discover hub + Explorer Board)\n');

// useDiscoverHub paths
const { data: speciesRows, error: spErr } = await supabase
  .from('explore_species')
  .select(EXPLORE_SPECIES_SELECT)
  .eq('state', STATE)
  .order('rank', { ascending: true })
  .limit(500);
if (spErr) throw spErr;
const species = (speciesRows ?? []).map(mapSpecies);
const animals = species.filter((s) => s.type === 'animals');
const plants = species.filter((s) => s.type === 'plants');
console.log(`  species: ${species.length} (${animals.length} animals, ${plants.length} plants)`);

const { data: featuredRaw, error: featErr } = await supabase.rpc('get_featured_species');
if (featErr) throw featErr;
const featured = (Array.isArray(featuredRaw) ? featuredRaw : []).map(mapSpecies);
console.log(`  featured: ${featured.length} — ${featured.map((f) => f.commonName).join(', ') || '(none)'}`);

const { data: summaryRaw, error: sumErr } = await supabase.rpc('get_park_summary_for_state', {
  p_state: STATE,
});
let parkCount = 0;
let speciesSightings = 0;
if (!sumErr) {
  const row = Array.isArray(summaryRaw) ? summaryRaw[0] : null;
  parkCount = Number(row?.park_count ?? 0);
  speciesSightings = Number(row?.species_sightings ?? 0);
} else {
  const { data: parks, error: parksErr } = await supabase
    .from('parks_with_counts')
    .select('*')
    .eq('state', STATE);
  if (parksErr) throw parksErr;
  parkCount = parks?.length ?? 0;
  speciesSightings = (parks ?? []).reduce((s, p) => s + Number(p.total_species ?? 0), 0);
  console.log(`  park summary: fallback list (${sumErr.message})`);
}
console.log(`  park summary: ${parkCount} parks, ${speciesSightings} species sightings`);

// leaderboardService path
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
console.log(`  leaderboard page: ${rows.length} rows, hasMore=${hasMore}`);
if (rows[0]) {
  console.log(
    `  #1: ${rows[0].username} — ${rows[0].totalPoints} pts, motto=${rows[0].motto ? 'yes' : 'null'}`,
  );
}

const failures = [];
if (species.length < 12) failures.push(`expected >=12 species, got ${species.length}`);
if (featured.length < 1) failures.push('expected >=1 featured species');
if (parkCount < 1) failures.push('expected >=1 park');
if (rows.length < 1) failures.push('leaderboard empty');

if (failures.length) {
  console.error('\nFAILED:', failures.join('; '));
  process.exit(1);
}
console.log('\nApp paths OK — Discover hub and Explorer Board data load correctly.\n');
