/**
 * Copy v13 global TFLite heads into Near Nature assets.
 *
 * Usage:
 *   node scripts/sync-v13-models.mjs
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  V13_HEAD_IDS,
  V13_TFLITE_NAMES,
  buildV13AppCascadeJson,
  resolveV13HeadSourceDir,
} from './v13-cascade-manifest.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const V13_ROOT = join(root, 'assets/tflite/v13/global');
const PREVIEW_KINGDOM_GLOBAL = join(root, 'assets/tflite/preview_models/kingdom_global/tflite');

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function copyHead(headId) {
  const srcDir = resolveV13HeadSourceDir(headId);
  const tfliteBase = V13_TFLITE_NAMES[headId] ?? headId;
  const srcTflite = join(srcDir, `${tfliteBase}.tflite`);
  const srcLabels = join(srcDir, 'labels.json');

  if (!existsSync(srcTflite)) {
    throw new Error(`Missing ${srcTflite} — run python v13/training/scripts/export_v13_tflite.py`);
  }
  if (!existsSync(srcLabels)) {
    throw new Error(`Missing ${srcLabels}`);
  }

  const destDir = join(V13_ROOT, headId, 'tflite');
  ensureDir(destDir);
  copyFileSync(srcTflite, join(destDir, `${tfliteBase}.tflite`));
  copyFileSync(srcLabels, join(destDir, 'labels.json'));
  const modelInfo = join(srcDir, 'model_info.json');
  if (existsSync(modelInfo)) {
    copyFileSync(modelInfo, join(destDir, 'model_info.json'));
  }
  console.log(`  ${headId} <- ${srcDir}`);
}

function syncPreviewKingdom() {
  console.log('\npreview kingdom_global:');
  const srcDir = join(V13_ROOT, 'step01_kingdom', 'tflite');
  ensureDir(PREVIEW_KINGDOM_GLOBAL);
  copyFileSync(join(srcDir, 'kingdom.tflite'), join(PREVIEW_KINGDOM_GLOBAL, 'kingdom.tflite'));
  copyFileSync(join(srcDir, 'labels.json'), join(PREVIEW_KINGDOM_GLOBAL, 'labels.json'));
  const modelInfo = join(srcDir, 'model_info.json');
  if (existsSync(modelInfo)) {
    copyFileSync(modelInfo, join(PREVIEW_KINGDOM_GLOBAL, 'model_info.json'));
  }
  console.log(`  ${PREVIEW_KINGDOM_GLOBAL}`);
}

function main() {
  console.log('Syncing v13 global cascade');
  for (const headId of V13_HEAD_IDS) {
    copyHead(headId);
  }

  syncPreviewKingdom();

  const appCascade = buildV13AppCascadeJson();
  const cascadeDest = join(root, 'assets/tflite/v13/cascade.json');
  ensureDir(dirname(cascadeDest));
  writeFileSync(cascadeDest, `${JSON.stringify(appCascade, null, 2)}\n`);
  console.log(`\nwrote ${cascadeDest}`);
  console.log('\nDone.');
}

main();
