import { createHash } from 'node:crypto';
import {
  createReadStream,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

import { loadProjectEnv, requireSupabaseSeedEnv } from './loadSupabaseSeedEnv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const REGION_ID = process.argv[2] ?? 'southeast';
const BUNDLE_DIR = resolve(
  root,
  'assets/tflite/near_nature_app_bundle/inat2021_specialists_v2',
);
const GENUS_INFO_DIR = resolve(root, 'assets/tflite/near_nature_app_bundle/genus_info');
const VERSION = process.argv[3] ?? '2026.06.1';

function sha256File(filePath) {
  return new Promise((resolvePromise, reject) => {
    const hash = createHash('sha256');
    createReadStream(filePath)
      .on('data', (chunk) => hash.update(chunk))
      .on('error', reject)
      .on('end', () => resolvePromise(hash.digest('hex')));
  });
}

function walkFiles(dir, predicate) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, predicate));
      continue;
    }
    if (predicate(full)) {
      results.push(full);
    }
  }
  return results;
}

function collectBundleFiles() {
  const specialistFiles = walkFiles(BUNDLE_DIR, (filePath) => {
    const rel = relative(BUNDLE_DIR, filePath).replace(/\\/g, '/');
    if (rel.includes('/tflite_out/')) return false;
    if (rel === 'routing.json') return true;
    if (rel.endsWith('_genus.tflite') || rel.endsWith('_species.tflite')) return true;
    if (rel.includes('/tflite/') && rel.endsWith('labels.json')) return true;
    return false;
  });

  const genusFiles = walkFiles(GENUS_INFO_DIR, (filePath) => filePath.endsWith('.json'));

  const files = [];
  for (const abs of specialistFiles) {
    const relUnderV2 = relative(BUNDLE_DIR, abs).replace(/\\/g, '/');
    files.push({
      abs,
      path: `inat2021_specialists_v2/${relUnderV2}`,
    });
  }
  for (const abs of genusFiles) {
    const rel = relative(resolve(root, 'assets/tflite/near_nature_app_bundle'), abs).replace(/\\/g, '/');
    files.push({ abs, path: rel });
  }
  return files;
}

async function buildManifest(files) {
  const manifestFiles = [];
  let totalSizeBytes = 0;

  for (const file of files) {
    const sizeBytes = statSync(file.abs).size;
    const sha256 = await sha256File(file.abs);
    totalSizeBytes += sizeBytes;
    manifestFiles.push({
      path: file.path,
      storagePath: `${REGION_ID}/${file.path}`,
      sizeBytes,
      sha256,
    });
  }

  return {
    regionId: REGION_ID,
    version: VERSION,
    bundle: 'near_nature_inat2021_v2',
    builtAt: new Date().toISOString().slice(0, 10),
    minAppVersion: '1.0.0',
    totalSizeBytes,
    files: manifestFiles,
  };
}

async function uploadFile(supabase, storagePath, absPath) {
  const body = readFileSync(absPath);
  const contentType = absPath.endsWith('.tflite')
    ? 'application/octet-stream'
    : 'application/json';
  const { error } = await supabase.storage.from('region-models').upload(storagePath, body, {
    upsert: true,
    contentType,
  });
  if (error) {
    throw new Error(`Upload failed for ${storagePath}: ${error.message}`);
  }
}

async function main() {
  const env = loadProjectEnv();
  const { url, serviceKey } = requireSupabaseSeedEnv(env);
  const supabase = createClient(url, serviceKey);

  const files = collectBundleFiles();
  if (files.length === 0) {
    console.error('No bundle files found. Ensure specialist .tflite files exist under assets.');
    process.exit(1);
  }

  console.log(`Building manifest for ${REGION_ID} (${files.length} files)…`);
  const manifest = await buildManifest(files);

  const distDir = resolve(root, `dist/region-models/${REGION_ID}`);
  const manifestPath = join(distDir, 'manifest.json');
  mkdirSync(distDir, { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Wrote ${manifestPath}`);

  console.log('Uploading to Supabase Storage bucket region-models…');
  for (const file of manifest.files) {
    const source = files.find((f) => f.path === file.path)?.abs;
    if (!source) continue;
    process.stdout.write(`  ${file.storagePath}\n`);
    await uploadFile(supabase, file.storagePath, source);
  }

  await uploadFile(supabase, `${REGION_ID}/manifest.json`, manifestPath);
  console.log(`Done. Public manifest: ${url}/storage/v1/object/public/region-models/${REGION_ID}/manifest.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
