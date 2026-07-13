/**
 * Copy v18 TFLite bundle into Near Nature assets.
 *
 * Usage:
 *   node scripts/sync-v18-models.mjs
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const sourceRoot = resolve(root, '../python/v18/models/tflite');
const destRoot = join(root, 'assets/tflite/v18/tflite');
const catalogPath = resolve(root, '../python/v15/training/data/global/catalog.csv');
const niebauerPath = resolve(root, '../python/v5/catalog/data/niebauer_training.csv');
const labelsPath = join(sourceRoot, 'labels.json');

const FILES = ['v18.tflite', 'v18_fp16.tflite', 'labels.json', 'model_info.json'];

function kingdomToTaxon(kingdom, specialistGroup) {
  if (kingdom === 'Plantae') return 'plants';
  if (kingdom === 'Fungi') return 'fungi';
  if (specialistGroup === 'birds') return 'birds';
  return 'animals';
}

function loadCatalogTaxonomy() {
  const map = new Map();
  if (!existsSync(catalogPath)) {
    console.warn(`  Missing catalog ${catalogPath}`);
    return map;
  }

  const lines = readFileSync(catalogPath, 'utf8').trim().split(/\r?\n/).slice(1);
  for (const line of lines) {
    const parts = line.split(',');
    if (parts.length < 4) continue;
    const kingdom = parts[1];
    const specialistGroup = parts[2];
    const family = parts[3];
    if (!family || map.has(family)) continue;
    map.set(family, kingdomToTaxon(kingdom, specialistGroup));
  }
  return map;
}

function applyNiebauerFamilies(map) {
  if (!existsSync(niebauerPath)) {
    console.warn(`  Missing niebauer training ${niebauerPath}`);
    return;
  }

  const lines = readFileSync(niebauerPath, 'utf8').trim().split(/\r?\n/).slice(1);
  for (const line of lines) {
    const parts = line.split(',');
    if (parts.length < 2) continue;
    const family = parts[1];
    if (family) {
      map.set(family, 'plants');
    }
  }
}

function writeFamilyTaxonomy() {
  const merged = loadCatalogTaxonomy();
  applyNiebauerFamilies(merged);

  if (existsSync(labelsPath)) {
    const labels = JSON.parse(readFileSync(labelsPath, 'utf8'));
    for (const row of labels.labels ?? []) {
      const family = row.name;
      if (!family || merged.has(family)) continue;
      merged.set(family, 'animals');
      console.warn(`  family_taxonomy: ${family} missing from catalog — defaulting to animals`);
    }
  }

  const out = Object.fromEntries(merged);
  writeFileSync(join(destRoot, 'family_taxonomy.json'), `${JSON.stringify(out, null, 2)}\n`);
  console.log(`  family_taxonomy.json (${Object.keys(out).length} families)`);
}

function patchModelInfo(destPath) {
  const info = JSON.parse(readFileSync(destPath, 'utf8'));
  info.tfliteFile = 'v18.tflite';
  info.weightDtype = 'float32';
  info.inputDtype = 'float32';
  writeFileSync(destPath, `${JSON.stringify(info, null, 2)}\n`);
}

function main() {
  if (!existsSync(join(sourceRoot, 'v18.tflite'))) {
    throw new Error(`Missing ${join(sourceRoot, 'v18.tflite')} — run python v18 export first`);
  }

  mkdirSync(destRoot, { recursive: true });
  for (const name of FILES) {
    const src = join(sourceRoot, name);
    if (!existsSync(src)) {
      console.warn(`  SKIP missing ${src}`);
      continue;
    }
    const dest = join(destRoot, name);
    copyFileSync(src, dest);
    if (name === 'model_info.json') {
      patchModelInfo(dest);
    }
    console.log(`  ${name} -> assets/tflite/v18/tflite/${name}`);
  }
  writeFamilyTaxonomy();
  console.log('Done.');
}

main();
