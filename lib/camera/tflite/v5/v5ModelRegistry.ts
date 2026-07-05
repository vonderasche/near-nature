import kingdomLabelsJson from '@/assets/tflite/v5/global/step01_kingdom/tflite/labels.json';
import commonMammalsLabelsJson from '@/assets/tflite/v5/global/common_mammals/tflite/labels.json';
import plantRouterLabelsJson from '@/assets/tflite/v5/southeast/step02_plant_router/tflite/labels.json';
import animalRouterLabelsJson from '@/assets/tflite/v5/southeast/step03_animal_router/tflite/labels.json';
import treesShrubsLabelsJson from '@/assets/tflite/v5/southeast/trees_shrubs/tflite/labels.json';
import wildflowersHerbsLabelsJson from '@/assets/tflite/v5/southeast/wildflowers_herbs/tflite/labels.json';
import fernsMossesLabelsJson from '@/assets/tflite/v5/southeast/ferns_mosses/tflite/labels.json';
import birdsLabelsJson from '@/assets/tflite/v5/southeast/birds/tflite/labels.json';
import herpsLabelsJson from '@/assets/tflite/v5/southeast/herps/tflite/labels.json';
import insectsLabelsJson from '@/assets/tflite/v5/southeast/insects/tflite/labels.json';
import lepidopteraLabelsJson from '@/assets/tflite/v5/southeast/lepidoptera/tflite/labels.json';
import arachnidsLabelsJson from '@/assets/tflite/v5/southeast/arachnids/tflite/labels.json';

import { labelsFromBundle } from '@/lib/camera/tflite/preview/parseLabelsBundle';
import type { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';

const IMAGENET_MEAN: [number, number, number] = [0.485, 0.456, 0.406];
const IMAGENET_STD: [number, number, number] = [0.229, 0.224, 0.225];

export type V5SpecialistGroup =
  | 'trees_shrubs'
  | 'wildflowers_herbs'
  | 'ferns_mosses'
  | 'birds'
  | 'herps'
  | 'insects'
  | 'lepidoptera'
  | 'arachnids'
  | 'common_mammals';

type LabelsFile = { labels: { index: number; name: string }[] };

type V5ModelEntry = {
  id: string;
  labels: readonly string[];
  modelAsset: number;
  inputSize: number;
  displayName: string;
};

function labels(meta: LabelsFile): readonly string[] {
  return labelsFromBundle(meta);
}

function buildConfig(entry: V5ModelEntry): ClassificationModelConfig {
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

const V5_MODEL_ENTRIES: Record<
  'kingdom' | 'plant_router' | 'animal_router' | V5SpecialistGroup,
  V5ModelEntry
> = {
  kingdom: {
    id: 'v5-kingdom',
    displayName: 'Kingdom',
    labels: labels(kingdomLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v5/global/step01_kingdom/tflite/kingdom.tflite'),
    inputSize: 224,
  },
  plant_router: {
    id: 'v5-plant-router',
    displayName: 'Plant router',
    labels: labels(plantRouterLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v5/southeast/step02_plant_router/tflite/plant_router.tflite'),
    inputSize: 240,
  },
  animal_router: {
    id: 'v5-animal-router',
    displayName: 'Animal router',
    labels: labels(animalRouterLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v5/southeast/step03_animal_router/tflite/animal_router.tflite'),
    inputSize: 240,
  },
  trees_shrubs: {
    id: 'v5-trees-shrubs',
    displayName: 'Trees & shrubs',
    labels: labels(treesShrubsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v5/southeast/trees_shrubs/tflite/trees_shrubs.tflite'),
    inputSize: 240,
  },
  wildflowers_herbs: {
    id: 'v5-wildflowers-herbs',
    displayName: 'Wildflowers & herbs',
    labels: labels(wildflowersHerbsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v5/southeast/wildflowers_herbs/tflite/wildflowers_herbs.tflite'),
    inputSize: 240,
  },
  ferns_mosses: {
    id: 'v5-ferns-mosses',
    displayName: 'Ferns & mosses',
    labels: labels(fernsMossesLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v5/southeast/ferns_mosses/tflite/ferns_mosses.tflite'),
    inputSize: 240,
  },
  birds: {
    id: 'v5-birds',
    displayName: 'Birds',
    labels: labels(birdsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v5/southeast/birds/tflite/birds.tflite'),
    inputSize: 240,
  },
  herps: {
    id: 'v5-herps',
    displayName: 'Herps',
    labels: labels(herpsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v5/southeast/herps/tflite/herps.tflite'),
    inputSize: 240,
  },
  insects: {
    id: 'v5-insects',
    displayName: 'Insects',
    labels: labels(insectsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v5/southeast/insects/tflite/insects.tflite'),
    inputSize: 240,
  },
  lepidoptera: {
    id: 'v5-lepidoptera',
    displayName: 'Lepidoptera',
    labels: labels(lepidopteraLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v5/southeast/lepidoptera/tflite/lepidoptera.tflite'),
    inputSize: 240,
  },
  arachnids: {
    id: 'v5-arachnids',
    displayName: 'Arachnids',
    labels: labels(arachnidsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v5/southeast/arachnids/tflite/arachnids.tflite'),
    inputSize: 240,
  },
  common_mammals: {
    id: 'v5-common-mammals',
    displayName: 'Common mammals',
    labels: labels(commonMammalsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v5/global/common_mammals/tflite/common_mammals.tflite'),
    inputSize: 240,
  },
};

export function getV5ModelConfig(
  key: keyof typeof V5_MODEL_ENTRIES,
): ClassificationModelConfig {
  return buildConfig(V5_MODEL_ENTRIES[key]);
}

export function getV5SpecialistConfig(group: V5SpecialistGroup): ClassificationModelConfig {
  return getV5ModelConfig(group);
}

export function isV5SpecialistGroup(value: string): value is V5SpecialistGroup {
  return value in V5_MODEL_ENTRIES && value !== 'kingdom' && value !== 'plant_router' && value !== 'animal_router';
}

/** Relative path under `regions/{storageId}/` for downloaded v5 packs. */
export function getV5RegionalRelativePath(
  key: Exclude<keyof typeof V5_MODEL_ENTRIES, 'kingdom' | 'common_mammals'>,
): string {
  if (key === 'plant_router') {
    return 'v5/southeast/step02_plant_router/tflite/plant_router.tflite';
  }
  if (key === 'animal_router') {
    return 'v5/southeast/step03_animal_router/tflite/animal_router.tflite';
  }
  return `v5/southeast/${key}/tflite/${key}.tflite`;
}

export function getV5GlobalRelativePath(key: 'kingdom' | 'common_mammals'): string {
  if (key === 'kingdom') {
    return 'v5/global/step01_kingdom/tflite/kingdom.tflite';
  }
  return 'v5/global/common_mammals/tflite/common_mammals.tflite';
}
