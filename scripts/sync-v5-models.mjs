/**
 * Copy v5 TFLite models from the training repo into Near Nature assets.
 *
 * Usage:
 *   node scripts/sync-v5-models.mjs
 *   node scripts/sync-v5-models.mjs --source "E:/PROGRAMMING/Portfolio/NearNature/python/v5/models"
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { V5_CASCADE_MANIFEST, v5RegionRoutingJson } from './v5-cascade-manifest.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const defaultSource = resolve(root, '../python/v5/models');
const sourceArg = process.argv.find((arg) => arg.startsWith('--source='))?.split('=')[1];
const SOURCE = resolve(sourceArg ?? defaultSource);

const V5_ROOT = join(root, 'assets/tflite/v5');
const PREVIEW_KINGDOM_V5 = join(root, 'assets/tflite/preview_models/kingdom_v5/tflite');

const SOUTHEAST_FOLDERS = [
  'step02_plant_router',
  'step03_animal_router',
  'trees_shrubs',
  'wildflowers_herbs',
  'ferns_mosses',
  'birds',
  'herps',
  'insects',
  'lepidoptera',
  'arachnids',
];

const GLOBAL_FOLDERS = ['step01_kingdom', 'common_mammals'];

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function copyPair(srcDir, destDir, tfliteName) {
  const srcTflite = join(srcDir, `${tfliteName}.tflite`);
  const srcLabels = join(srcDir, 'labels.json');
  if (!existsSync(srcTflite)) {
    throw new Error(`Missing ${srcTflite}`);
  }
  if (!existsSync(srcLabels)) {
    throw new Error(`Missing ${srcLabels}`);
  }
  ensureDir(destDir);
  copyFileSync(srcTflite, join(destDir, `${tfliteName}.tflite`));
  copyFileSync(srcLabels, join(destDir, 'labels.json'));
  const modelInfo = join(srcDir, 'model_info.json');
  if (existsSync(modelInfo)) {
    copyFileSync(modelInfo, join(destDir, 'model_info.json'));
  }
  console.log(`  ${destDir}`);
}

function syncRegionalFolder(regionId, folders) {
  console.log(`\n${regionId}:`);
  for (const folder of folders) {
    const srcTfliteDir = join(SOURCE, regionId, folder, 'tflite');
    const tfliteBase = folder === 'step02_plant_router'
      ? 'plant_router'
      : folder === 'step03_animal_router'
        ? 'animal_router'
        : folder;
    const destDir = join(V5_ROOT, regionId, folder, 'tflite');
    copyPair(srcTfliteDir, destDir, tfliteBase);
  }
}

function syncGlobal() {
  console.log('\nglobal:');
  for (const folder of GLOBAL_FOLDERS) {
    const srcTfliteDir = join(SOURCE, 'global', folder, 'tflite');
    const tfliteBase = folder === 'step01_kingdom' ? 'kingdom' : folder;
    const destDir = join(V5_ROOT, 'global', folder, 'tflite');
    copyPair(srcTfliteDir, destDir, tfliteBase);
  }
}

function syncPreviewKingdomV5() {
  console.log('\npreview kingdom_v5:');
  const srcDir = join(SOURCE, 'global', 'step01_kingdom', 'tflite');
  ensureDir(PREVIEW_KINGDOM_V5);
  copyFileSync(join(srcDir, 'kingdom.tflite'), join(PREVIEW_KINGDOM_V5, 'kingdom.tflite'));
  copyFileSync(join(srcDir, 'labels.json'), join(PREVIEW_KINGDOM_V5, 'labels.json'));
  const modelInfo = join(srcDir, 'model_info.json');
  if (existsSync(modelInfo)) {
    copyFileSync(modelInfo, join(PREVIEW_KINGDOM_V5, 'model_info.json'));
  }
  console.log(`  ${PREVIEW_KINGDOM_V5}`);
}

function writeCascadeManifests() {
  const cascadeDest = join(V5_ROOT, 'cascade.json');
  writeFileSync(cascadeDest, `${JSON.stringify(V5_CASCADE_MANIFEST, null, 2)}\n`);
  console.log(`\nwrote ${cascadeDest}`);

  const routing = v5RegionRoutingJson('southeast');
  const dest = join(V5_ROOT, 'southeast', 'routing.json');
  ensureDir(dirname(dest));
  writeFileSync(dest, `${JSON.stringify(routing, null, 2)}\n`);
  console.log(`wrote ${dest}`);
}

function main() {
  if (!existsSync(SOURCE)) {
    console.error(`Source not found: ${SOURCE}`);
    console.error('Pass --source=PATH to the v5 models directory.');
    process.exit(1);
  }

  console.log(`Syncing v5 models from ${SOURCE}`);
  syncGlobal();
  syncRegionalFolder('southeast', SOUTHEAST_FOLDERS);
  syncPreviewKingdomV5();
  writeCascadeManifests();
  console.log('\nDone.');
}

main();
