/**
 * Upload the global v18 capture model to Supabase Storage (`region-models/global/`).
 *
 * Usage:
 *   npm run sync:v18-models
 *   npm run upload:global-v18
 */
import { createHash } from 'node:crypto';
import { createReadStream, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

import { GLOBAL_CAPTURE_BUNDLE_NAME, GLOBAL_CAPTURE_STORAGE_ID } from './global-capture-bundle-constants.mjs';
import { loadProjectEnv, requireSupabaseSeedEnv } from './loadSupabaseSeedEnv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const VERSION = process.argv[2] ?? '2026.07.2';
const ASSET_ROOT = join(root, 'assets/tflite/v18/tflite');

const BUNDLE_FILES = ['v18.tflite', 'labels.json', 'model_info.json'];

function sha256File(absPath) {
  return new Promise((resolvePromise, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(absPath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolvePromise(hash.digest('hex')));
  });
}

async function buildManifest() {
  const files = [];
  let totalSizeBytes = 0;

  for (const name of BUNDLE_FILES) {
    const absPath = join(ASSET_ROOT, name);
    if (!existsSync(absPath)) {
      throw new Error(`Missing ${absPath}. Run npm run sync:v18-models first.`);
    }
    const relPath = `v18/tflite/${name}`;
    const stat = readFileSync(absPath);
    totalSizeBytes += stat.length;
    files.push({
      path: relPath,
      storagePath: `${GLOBAL_CAPTURE_STORAGE_ID}/${relPath}`,
      sizeBytes: stat.length,
      sha256: await sha256File(absPath),
      absPath,
    });
  }

  return {
    regionId: GLOBAL_CAPTURE_STORAGE_ID,
    version: VERSION,
    bundle: GLOBAL_CAPTURE_BUNDLE_NAME,
    builtAt: new Date().toISOString().slice(0, 10),
    minAppVersion: '1.0.0',
    totalSizeBytes,
    files: files.map(({ absPath: _absPath, ...rest }) => rest),
    uploadEntries: files,
  };
}

async function uploadFile(supabase, storagePath, absPath) {
  const body = readFileSync(absPath);
  const { error } = await supabase.storage.from('region-models').upload(storagePath, body, {
    upsert: true,
    contentType: storagePath.endsWith('.json') ? 'application/json' : 'application/octet-stream',
  });
  if (error) {
    throw new Error(`Upload failed for ${storagePath}: ${error.message}`);
  }
}

async function main() {
  const env = loadProjectEnv();
  const { url, serviceKey } = requireSupabaseSeedEnv(env);
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const manifest = await buildManifest();
  const distDir = resolve(root, `dist/region-models/${GLOBAL_CAPTURE_STORAGE_ID}`);
  mkdirSync(distDir, { recursive: true });
  const manifestPath = join(distDir, 'manifest.json');
  writeFileSync(
    manifestPath,
    `${JSON.stringify(
      {
        regionId: manifest.regionId,
        version: manifest.version,
        bundle: manifest.bundle,
        builtAt: manifest.builtAt,
        minAppVersion: manifest.minAppVersion,
        totalSizeBytes: manifest.totalSizeBytes,
        files: manifest.files,
      },
      null,
      2,
    )}\n`,
  );

  console.log(`Uploading v18 capture bundle (${Math.round(manifest.totalSizeBytes / 1_000_000)} MB)…`);
  for (const file of manifest.uploadEntries) {
    process.stdout.write(`  ${file.storagePath}\n`);
    await uploadFile(supabase, file.storagePath, file.absPath);
  }
  await uploadFile(supabase, `${GLOBAL_CAPTURE_STORAGE_ID}/manifest.json`, manifestPath);

  console.log(`Done. Public manifest: ${url}/storage/v1/object/public/region-models/${GLOBAL_CAPTURE_STORAGE_ID}/manifest.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
