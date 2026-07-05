/**
 * Copy v6 TFLite models from the training repo into Near Nature assets.
 *
 * Source: ../python/v6/models (global + all cascade regions).
 * Falls back to v5 assets only when a v6 export is missing locally.
 *
 * Usage:
 *   node scripts/sync-v6-models.mjs
 *   node scripts/sync-v6-models.mjs --source=../python/v6/models
 *   node scripts/sync-v6-models.mjs --regions=southeast,midwest
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  V6_CASCADE_MANIFEST,
  V6_GLOBAL_FOLDERS,
  V6_REGIONAL_FOLDERS,
  v6RegionRoutingJson,
  v6TfliteBase,
} from './v6-cascade-manifest.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const defaultV6Source = resolve(root, '../python/v6/models');
const v5Assets = join(root, 'assets/tflite/v5');
const sourceArg = process.argv.find((arg) => arg.startsWith('--source='))?.split('=')[1];
const regionsArg = process.argv.find((arg) => arg.startsWith('--regions='))?.split('=')[1];
const V6_SOURCE = resolve(sourceArg ?? defaultV6Source);
const REGION_IDS = regionsArg
  ? regionsArg.split(',').map((id) => id.trim()).filter(Boolean)
  : V6_CASCADE_MANIFEST.cascadeRegionIds;

const V6_ROOT = join(root, 'assets/tflite/v6');
const PREVIEW_KINGDOM_GLOBAL = join(root, 'assets/tflite/preview_models/kingdom_global/tflite');

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

function resolveSourceDir(scope, folder) {
  const v6Dir = join(V6_SOURCE, scope, folder, 'tflite');
  const v6Tflite = join(v6Dir, `${v6TfliteBase(folder)}.tflite`);
  if (existsSync(v6Tflite)) {
    return v6Dir;
  }

  if (scope === 'global') {
    const v5Global = join(v5Assets, 'global', folder, 'tflite');
    if (existsSync(join(v5Global, `${v6TfliteBase(folder)}.tflite`))) {
      console.warn(`  [bootstrap] global/${folder} from v5 global`);
      return v5Global;
    }
  }

  const v5Southeast = join(v5Assets, 'southeast', folder, 'tflite');
  if (existsSync(join(v5Southeast, `${v6TfliteBase(folder)}.tflite`))) {
    console.warn(`  [bootstrap] ${scope}/${folder} from v5 southeast`);
    return v5Southeast;
  }

  throw new Error(`No TFLite source for ${scope}/${folder} (checked v6, v5 global, v5 southeast)`);
}

function syncScope(scope, folders) {
  console.log(`\n${scope}:`);
  for (const folder of folders) {
    const srcDir = resolveSourceDir(scope, folder);
    const destDir = join(V6_ROOT, scope, folder, 'tflite');
    copyPair(srcDir, destDir, v6TfliteBase(folder));
  }
}

function syncPreviewKingdomGlobal() {
  console.log('\npreview kingdom_global:');
  const srcDir = join(V6_ROOT, 'global', 'step01_kingdom', 'tflite');
  ensureDir(PREVIEW_KINGDOM_GLOBAL);
  copyFileSync(join(srcDir, 'kingdom.tflite'), join(PREVIEW_KINGDOM_GLOBAL, 'kingdom.tflite'));
  copyFileSync(join(srcDir, 'labels.json'), join(PREVIEW_KINGDOM_GLOBAL, 'labels.json'));
  const modelInfo = join(srcDir, 'model_info.json');
  if (existsSync(modelInfo)) {
    copyFileSync(modelInfo, join(PREVIEW_KINGDOM_GLOBAL, 'model_info.json'));
  }
  console.log(`  ${PREVIEW_KINGDOM_GLOBAL}`);
}

function writeManifests() {
  const cascadeDest = join(V6_ROOT, 'cascade.json');
  writeFileSync(cascadeDest, `${JSON.stringify(V6_CASCADE_MANIFEST, null, 2)}\n`);
  console.log(`\nwrote ${cascadeDest}`);

  for (const regionId of V6_CASCADE_MANIFEST.cascadeRegionIds) {
    const routing = v6RegionRoutingJson(regionId);
    const dest = join(V6_ROOT, regionId, 'routing.json');
    ensureDir(dirname(dest));
    writeFileSync(dest, `${JSON.stringify(routing, null, 2)}\n`);
    console.log(`wrote ${dest}`);
  }
}

function main() {
  console.log(`Syncing v6 models (python source: ${V6_SOURCE})`);
  syncScope('global', V6_GLOBAL_FOLDERS);
  for (const regionId of REGION_IDS) {
    syncScope(regionId, V6_REGIONAL_FOLDERS);
  }
  syncPreviewKingdomGlobal();
  writeManifests();
  console.log('\nDone.');
}

main();
