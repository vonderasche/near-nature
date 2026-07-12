/** v13 global cascade — keep aligned with python/v13/inference/cascade.py */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

export const V13_PYTHON_ROOT = resolve(root, '../python/v13');
export const V13_MODEL_ROOT = join(V13_PYTHON_ROOT, 'models/global');

export const V13_PLANT_GROUPS = ['trees_shrubs', 'wildflowers_herbs', 'ferns_mosses', 'coontie'];
export const V13_ANIMAL_GROUPS = [
  'birds',
  'herps',
  'lepidoptera',
  'insects',
  'arachnids',
  'wild_mammals',
  'domestic_mammals',
];

export const V13_HEAD_IDS = [
  'step01_kingdom',
  'step02_plant_router',
  'step03_animal_router',
  ...V13_PLANT_GROUPS,
  ...V13_ANIMAL_GROUPS,
];

export const V13_TFLITE_NAMES = {
  step01_kingdom: 'kingdom',
  step02_plant_router: 'plant_router',
  step03_animal_router: 'animal_router',
  trees_shrubs: 'trees_shrubs',
  wildflowers_herbs: 'wildflowers_herbs',
  ferns_mosses: 'ferns_mosses',
  coontie: 'coontie',
  birds: 'birds',
  herps: 'herps',
  lepidoptera: 'lepidoptera',
  insects: 'insects',
  arachnids: 'arachnids',
  wild_mammals: 'wild_mammals',
  domestic_mammals: 'domestic_mammals',
};

export const V13_INPUT_SIZES = {
  step01_kingdom: 224,
  step02_plant_router: 240,
  step03_animal_router: 240,
  trees_shrubs: 240,
  wildflowers_herbs: 240,
  ferns_mosses: 240,
  coontie: 240,
  birds: 240,
  herps: 240,
  lepidoptera: 240,
  insects: 240,
  arachnids: 240,
  wild_mammals: 240,
  domestic_mammals: 240,
};

export function resolveV13HeadSourceDir(headId) {
  return join(V13_MODEL_ROOT, headId, 'tflite');
}

export function buildV13AppCascadeJson() {
  const heads = {};
  for (const headId of V13_HEAD_IDS) {
    heads[headId] = {
      dir: headId,
      tflite: V13_TFLITE_NAMES[headId] ?? headId,
      inputSize: V13_INPUT_SIZES[headId] ?? 240,
    };
  }
  return {
    version: 'v13',
    description: 'Full retrain global cascade (no distill composite)',
    plantRouterGroups: V13_PLANT_GROUPS,
    animalRouterGroups: V13_ANIMAL_GROUPS,
    heads,
  };
}

export function readV13ModelInfo(headId) {
  const modelInfoPath = join(resolveV13HeadSourceDir(headId), 'model_info.json');
  try {
    return JSON.parse(readFileSync(modelInfoPath, 'utf8'));
  } catch {
    return null;
  }
}
