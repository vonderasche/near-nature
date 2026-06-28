/**
 * Download standard Google TFLite ImageNet classifiers into assets/tflite/preview_models/.
 * Run: npm run fetch:preview-models
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const previewRoot = join(root, 'assets/tflite/preview_models');

/** @typedef {{ id: string; filename: string; urls: string[]; optional?: boolean }} DownloadSpec */

/** @type {DownloadSpec[]} */
const DOWNLOADS = [
  {
    id: 'efficientnet_lite0_imagenet',
    filename: 'efficientnet_lite0.tflite',
    urls: [
      'https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite0/float32/1/efficientnet_lite0.tflite',
    ],
  },
  {
    id: 'efficientnet_lite2_imagenet',
    filename: 'efficientnet_lite2.tflite',
    urls: [
      'https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite2/float32/1/efficientnet_lite2.tflite',
    ],
  },
  {
    id: 'mobilenet_v2_imagenet',
    filename: 'mobilenet_v2_1.0_224.tflite',
    urls: [
      // TF Hub bucket often returns 403; these mirrors are official Google test artifacts.
      'https://raw.githubusercontent.com/google-ai-edge/LiteRT/main/litert/test/testdata/mobilenet_v2_1.0_224.tflite',
      'https://github.com/tensorflow/tflite-support/raw/master/tensorflow_lite_support/metadata/python/tests/testdata/image_classifier/mobilenet_v2_1.0_224.tflite',
    ],
    optional: true,
  },
];

async function download(url, dest) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, buffer);
  console.log(`  wrote ${dest} (${buffer.length} bytes)`);
  return buffer.length;
}

async function downloadFirstAvailable(item) {
  const dest = join(previewRoot, item.id, 'tflite', item.filename);
  if (existsSync(dest)) {
    console.log(`  skip ${item.id} (already present)`);
    return;
  }

  console.log(`  ${item.id}`);
  const errors = [];
  for (const url of item.urls) {
    try {
      await download(url, dest);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${url} → ${message}`);
    }
  }

  if (item.optional) {
    console.warn(`  warn ${item.id}: all sources failed`);
    for (const line of errors) {
      console.warn(`    ${line}`);
    }
    return;
  }

  throw new Error(`${item.id}: all sources failed\n${errors.join('\n')}`);
}

async function main() {
  console.log('Fetching standard Google TFLite preview models…');
  for (const item of DOWNLOADS) {
    await downloadFirstAvailable(item);
  }

  const imagenetLabelsSrc = join(previewRoot, 'shared/imagenet1k_labels.json');
  for (const id of [
    'efficientnet_lite0_imagenet',
    'efficientnet_lite2_imagenet',
    'mobilenet_v2_imagenet',
  ]) {
    const labelsDest = join(previewRoot, id, 'tflite/labels.json');
    if (!existsSync(labelsDest) && existsSync(imagenetLabelsSrc)) {
      copyFileSync(imagenetLabelsSrc, labelsDest);
      console.log(`  linked labels for ${id}`);
    }
  }

  console.log('Done.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
