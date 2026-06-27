import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { loadProjectEnv, requireSupabaseSeedEnv } from './loadSupabaseSeedEnv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  return loadProjectEnv();
}

function normalizeLatinName(value) {
  return value.trim().toLowerCase().split(/\s+/)[0] ?? '';
}

function parseEntry(id, raw) {
  const genus = typeof raw.genus === 'string' ? raw.genus.trim() : id.trim();
  if (!genus) return null;

  const funFact = typeof raw.funFact === 'string' ? raw.funFact.trim() : '';
  const sourceUrls = { ...(raw.sourceUrls ?? {}) };
  if (raw.wikipediaThumbnail) sourceUrls.thumbnail = raw.wikipediaThumbnail;
  if (raw.defaultPhoto?.url) sourceUrls.defaultPhotoUrl = raw.defaultPhoto.url;

  return {
    id: genus,
    scientific_name: genus,
    scientific_name_normalized: normalizeLatinName(genus),
    common_name: typeof raw.commonName === 'string' && raw.commonName.trim() ? raw.commonName.trim() : genus,
    taxon_group: typeof raw.previewGroup === 'string' ? raw.previewGroup.trim() : '',
    florida_status: typeof raw.nativeRegion === 'string' ? raw.nativeRegion.trim() : 'unknown',
    family: typeof raw.familia === 'string' ? raw.familia.trim() : null,
    genus,
    description: typeof raw.description === 'string' ? raw.description.trim() : '',
    identification_traits: [],
    interesting_facts: funFact ? [funFact] : [],
    source_urls: sourceUrls,
    inat_taxon_id: raw.inatTaxonId ?? null,
    specialist_id: typeof raw.specialistId === 'string' ? raw.specialistId.trim() : null,
    catalog_source: 'bundled',
    updated_at: typeof raw.updatedAt === 'string' && raw.updatedAt ? raw.updatedAt : new Date().toISOString(),
  };
}

const env = loadEnv();
const { url, serviceKey } = requireSupabaseSeedEnv(env);

const catalogPath = resolve(
  root,
  'assets/tflite/near_nature_app_bundle/genus_info/genus_profiles.enriched.min.json',
);
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const rows = Object.entries(catalog)
  .map(([id, entry]) => parseEntry(id, entry))
  .filter(Boolean);

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BATCH = 200;
let upserted = 0;

console.log(`Seeding ${rows.length} bundled genus profiles to species_catalog...`);

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error } = await supabase.from('species_catalog').upsert(batch, { onConflict: 'id' });
  if (error) {
    console.error('Upsert failed:', error.message);
    process.exit(1);
  }
  upserted += batch.length;
  console.log(`  ${upserted}/${rows.length}`);
}

console.log('Done. Reload Supabase schema cache if needed.');
