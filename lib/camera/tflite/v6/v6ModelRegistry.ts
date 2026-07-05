import kingdomLabelsJson from '@/assets/tflite/v6/global/step01_kingdom/tflite/labels.json';
import commonMammalsLabelsJson from '@/assets/tflite/v6/global/common_mammals/tflite/labels.json';
import plantRouterLabelsJson from '@/assets/tflite/v6/global/step02_plant_router/tflite/labels.json';
import animalRouterLabelsJson from '@/assets/tflite/v6/global/step03_animal_router/tflite/labels.json';
import treesShrubsLabelsJson from '@/assets/tflite/v6/global/trees_shrubs/tflite/labels.json';
import wildflowersHerbsLabelsJson from '@/assets/tflite/v6/global/wildflowers_herbs/tflite/labels.json';
import fernsMossesLabelsJson from '@/assets/tflite/v6/global/ferns_mosses/tflite/labels.json';
import birdsLabelsJson from '@/assets/tflite/v6/global/birds/tflite/labels.json';
import herpsLabelsJson from '@/assets/tflite/v6/global/herps/tflite/labels.json';
import insectsLabelsJson from '@/assets/tflite/v6/global/insects/tflite/labels.json';
import lepidopteraLabelsJson from '@/assets/tflite/v6/global/lepidoptera/tflite/labels.json';
import arachnidsLabelsJson from '@/assets/tflite/v6/global/arachnids/tflite/labels.json';

import { labelsFromBundle } from '@/lib/camera/tflite/preview/parseLabelsBundle';
import type { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';
import type { V6CascadeRegionId } from '@/lib/camera/tflite/v6/v6CascadeRegions';
import type { V6SpecialistGroup, V6StageKey } from '@/lib/camera/tflite/v6/v6Groups';

const IMAGENET_MEAN: [number, number, number] = [0.485, 0.456, 0.406];
const IMAGENET_STD: [number, number, number] = [0.229, 0.224, 0.225];

type LabelsFile = { labels: { index: number; name: string }[] };

type V6ModelEntry = {
  id: string;
  labels: readonly string[];
  modelAsset: number;
  inputSize: number;
  displayName: string;
  globalFolder: string;
  tfliteBase: string;
};

function labels(meta: LabelsFile): readonly string[] {
  return labelsFromBundle(meta);
}

function buildConfig(entry: V6ModelEntry): ClassificationModelConfig {
  return {
    id: entry.id,
    name: entry.displayName,
    task: 'classification',
    labels: [...entry.labels],
    model: entry.modelAsset,
    input: {
      width: entry.inputSize,
      height: entry.inputSize,
      pixelFormat: 'rgb',
      dataType: 'float32',
      normalization: { mean: IMAGENET_MEAN, std: IMAGENET_STD },
    },
    targetFps: 1,
    topK: 3,
    outputType: 'float',
    confidenceMode: 'softmax',
    directLabelIndex: true,
    softmaxOutput: true,
  };
}

const V6_MODEL_ENTRIES: Record<V6StageKey, V6ModelEntry> = {
  kingdom: {
    id: 'v6-kingdom',
    displayName: 'Kingdom',
    labels: labels(kingdomLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v6/global/step01_kingdom/tflite/kingdom.tflite'),
    inputSize: 224,
    globalFolder: 'step01_kingdom',
    tfliteBase: 'kingdom',
  },
  plant_router: {
    id: 'v6-plant-router',
    displayName: 'Plant router',
    labels: labels(plantRouterLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v6/global/step02_plant_router/tflite/plant_router.tflite'),
    inputSize: 240,
    globalFolder: 'step02_plant_router',
    tfliteBase: 'plant_router',
  },
  animal_router: {
    id: 'v6-animal-router',
    displayName: 'Animal router',
    labels: labels(animalRouterLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v6/global/step03_animal_router/tflite/animal_router.tflite'),
    inputSize: 240,
    globalFolder: 'step03_animal_router',
    tfliteBase: 'animal_router',
  },
  trees_shrubs: {
    id: 'v6-trees-shrubs',
    displayName: 'Trees & shrubs',
    labels: labels(treesShrubsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v6/global/trees_shrubs/tflite/trees_shrubs.tflite'),
    inputSize: 240,
    globalFolder: 'trees_shrubs',
    tfliteBase: 'trees_shrubs',
  },
  wildflowers_herbs: {
    id: 'v6-wildflowers-herbs',
    displayName: 'Wildflowers & herbs',
    labels: labels(wildflowersHerbsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v6/global/wildflowers_herbs/tflite/wildflowers_herbs.tflite'),
    inputSize: 240,
    globalFolder: 'wildflowers_herbs',
    tfliteBase: 'wildflowers_herbs',
  },
  ferns_mosses: {
    id: 'v6-ferns-mosses',
    displayName: 'Ferns & mosses',
    labels: labels(fernsMossesLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v6/global/ferns_mosses/tflite/ferns_mosses.tflite'),
    inputSize: 240,
    globalFolder: 'ferns_mosses',
    tfliteBase: 'ferns_mosses',
  },
  birds: {
    id: 'v6-birds',
    displayName: 'Birds',
    labels: labels(birdsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v6/global/birds/tflite/birds.tflite'),
    inputSize: 240,
    globalFolder: 'birds',
    tfliteBase: 'birds',
  },
  herps: {
    id: 'v6-herps',
    displayName: 'Herps',
    labels: labels(herpsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v6/global/herps/tflite/herps.tflite'),
    inputSize: 240,
    globalFolder: 'herps',
    tfliteBase: 'herps',
  },
  insects: {
    id: 'v6-insects',
    displayName: 'Insects',
    labels: labels(insectsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v6/global/insects/tflite/insects.tflite'),
    inputSize: 240,
    globalFolder: 'insects',
    tfliteBase: 'insects',
  },
  lepidoptera: {
    id: 'v6-lepidoptera',
    displayName: 'Lepidoptera',
    labels: labels(lepidopteraLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v6/global/lepidoptera/tflite/lepidoptera.tflite'),
    inputSize: 240,
    globalFolder: 'lepidoptera',
    tfliteBase: 'lepidoptera',
  },
  arachnids: {
    id: 'v6-arachnids',
    displayName: 'Arachnids',
    labels: labels(arachnidsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v6/global/arachnids/tflite/arachnids.tflite'),
    inputSize: 240,
    globalFolder: 'arachnids',
    tfliteBase: 'arachnids',
  },
  common_mammals: {
    id: 'v6-common-mammals',
    displayName: 'Common mammals',
    labels: labels(commonMammalsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v6/global/common_mammals/tflite/common_mammals.tflite'),
    inputSize: 240,
    globalFolder: 'common_mammals',
    tfliteBase: 'common_mammals',
  },
};

export function getV6ModelConfig(key: V6StageKey): ClassificationModelConfig {
  return buildConfig(V6_MODEL_ENTRIES[key]);
}

export function isV6SpecialistGroup(value: string): value is V6SpecialistGroup {
  return value in V6_MODEL_ENTRIES && value !== 'kingdom' && value !== 'plant_router' && value !== 'animal_router';
}

function regionalFolderForKey(key: V6StageKey): string {
  const entry = V6_MODEL_ENTRIES[key];
  if (key === 'plant_router' || key === 'animal_router') {
    return entry.globalFolder;
  }
  return entry.globalFolder;
}

/** Relative path under `regions/{storageId}/` for downloaded regional v6 packs. */
export function getV6RegionalRelativePath(
  cascadeRegionId: V6CascadeRegionId,
  key: Exclude<V6StageKey, 'kingdom' | 'common_mammals'>,
): string {
  const folder = regionalFolderForKey(key);
  const tfliteBase = V6_MODEL_ENTRIES[key].tfliteBase;
  return `v6/${cascadeRegionId}/${folder}/tflite/${tfliteBase}.tflite`;
}

export { type V6SpecialistGroup, type V6StageKey };
