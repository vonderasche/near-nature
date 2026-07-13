/**
 * Copy v16 TFLite bundle into Near Nature assets.
 *
 * Usage:
 *   node scripts/sync-v16-models.mjs
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const sourceRoot = resolve(root, '../python/v16/models/tflite');
const destRoot = join(root, 'assets/tflite/v16/tflite');
const catalogPath = resolve(root, '../python/v16/training/data/global/catalog.csv');

const FILES = ['v16.tflite', 'v16_fp16.tflite', 'labels.json', 'model_info.json'];

function writeFamilyTaxonomy() {
  if (!existsSync(catalogPath)) {
    console.warn(`  Skipping family_taxonomy.json — missing ${catalogPath}`);
    return;
  }

  const lines = readFileSync(catalogPath, 'utf8').trim().split(/\r?\n/).slice(1);
  const map = new Map();
  for (const line of lines) {
    const parts = line.split(',');
    if (parts.length < 4) continue;
    const kingdom = parts[1];
    const specialistGroup = parts[2];
    const family = parts[3];
    if (!family || map.has(family)) continue;
    map.set(family, { kingdom, specialistGroup });
  }

  const taxonomy = {};
  for (const [family, { kingdom, specialistGroup }] of map) {
    let taxon = 'animals';
    if (kingdom === 'Plantae') taxon = 'plants';
    else if (kingdom === 'Fungi') taxon = 'fungi';
    else if (specialistGroup === 'birds') taxon = 'birds';
    taxonomy[family] = taxon;
  }

  writeFileSync(join(destRoot, 'family_taxonomy.json'), `${JSON.stringify(taxonomy, null, 2)}\n`);
  console.log(`  family_taxonomy.json (${Object.keys(taxonomy).length} families)`);
}

function patchModelInfo(destPath) {
  const info = JSON.parse(readFileSync(destPath, 'utf8'));
  info.tfliteFile = 'v16.tflite';
  info.weightDtype = 'float32';
  info.inputDtype = 'float32';
  writeFileSync(destPath, `${JSON.stringify(info, null, 2)}\n`);
}

function main() {
  if (!existsSync(join(sourceRoot, 'v16.tflite'))) {
    throw new Error(`Missing ${join(sourceRoot, 'v16.tflite')} — run python v16 export first`);
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
    console.log(`  ${name} -> assets/tflite/v16/tflite/${name}`);
  }
  writeFamilyTaxonomy();
  console.log('Done.');
}

main();
