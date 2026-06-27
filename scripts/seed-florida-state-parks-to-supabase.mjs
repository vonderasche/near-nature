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

function parseCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function parseOptionalNumber(raw) {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

function parseBoolean(raw) {
  return String(raw ?? '').trim().toLowerCase() === 'true';
}

const env = loadEnv();
const { url, serviceKey } = requireSupabaseSeedEnv(env);

const csvPath = resolve(root, 'assets/data/florida_state_parks.csv');
const csvText = readFileSync(csvPath, 'utf8');
const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
const [headerLine, ...dataLines] = lines;
const header = parseCsvLine(headerLine).map((cell) => cell.toLowerCase());

function rowToRecord(cells) {
  const record = {};
  header.forEach((column, index) => {
    record[column] = cells[index]?.trim() ?? '';
  });
  return record;
}

const rows = dataLines
  .map((line) => rowToRecord(parseCsvLine(line)))
  .filter((record) => record.park_id && record.park_name)
  .map((record) => ({
    park_id: record.park_id,
    unit_id: record.unit_id || null,
    park_name: record.park_name,
    web_alias: record.web_alias || null,
    county: record.county || null,
    district: record.district || null,
    acreage: parseOptionalNumber(record.acreage),
    address: record.address || null,
    city: record.city || null,
    state: record.state || 'FL',
    latitude: parseOptionalNumber(record.latitude),
    longitude: parseOptionalNumber(record.longitude),
    gps_source: record.gps_source || null,
    has_gps: parseBoolean(record.has_gps),
    park_page_url: record.park_page_url || null,
    image_url: record.image_url || null,
    image_source: record.image_source || null,
    image_license: record.image_license || null,
    image_attribution: record.image_attribution || null,
    description: record.description || null,
    top_plants: record.top_plants || null,
    top_plant_images: record.top_plant_images || null,
    top_animals: record.top_animals || null,
    top_animal_images: record.top_animal_images || null,
    public_access: record.public_access || null,
    data_source: record.data_source || null,
    updated_at: record.updated_at || null,
  }));

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BATCH = 50;
let upserted = 0;

console.log(`Seeding ${rows.length} Florida state parks to florida_state_parks...`);

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error } = await supabase.from('florida_state_parks').upsert(batch, { onConflict: 'park_id' });
  if (error) {
    console.error('Upsert failed:', error.message);
    process.exit(1);
  }
  upserted += batch.length;
  console.log(`  ${upserted}/${rows.length}`);
}

console.log('Done.');
