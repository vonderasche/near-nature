import kingdomLabelsJson from '@/assets/tflite/v13/global/step01_kingdom/tflite/labels.json';
import plantRouterLabelsJson from '@/assets/tflite/v13/global/step02_plant_router/tflite/labels.json';
import animalRouterLabelsJson from '@/assets/tflite/v13/global/step03_animal_router/tflite/labels.json';
import treesShrubsLabelsJson from '@/assets/tflite/v13/global/trees_shrubs/tflite/labels.json';
import wildflowersHerbsLabelsJson from '@/assets/tflite/v13/global/wildflowers_herbs/tflite/labels.json';
import fernsMossesLabelsJson from '@/assets/tflite/v13/global/ferns_mosses/tflite/labels.json';
import coontieLabelsJson from '@/assets/tflite/v13/global/coontie/tflite/labels.json';
import birdsLabelsJson from '@/assets/tflite/v13/global/birds/tflite/labels.json';
import herpsLabelsJson from '@/assets/tflite/v13/global/herps/tflite/labels.json';
import lepidopteraLabelsJson from '@/assets/tflite/v13/global/lepidoptera/tflite/labels.json';
import insectsLabelsJson from '@/assets/tflite/v13/global/insects/tflite/labels.json';
import arachnidsLabelsJson from '@/assets/tflite/v13/global/arachnids/tflite/labels.json';
import wildMammalsLabelsJson from '@/assets/tflite/v13/global/wild_mammals/tflite/labels.json';
import domesticMammalsLabelsJson from '@/assets/tflite/v13/global/domestic_mammals/tflite/labels.json';

import { labelsFromBundle } from '@/lib/camera/tflite/preview/parseLabelsBundle';
import type { ClassificationModelConfig } from '@/lib/camera/tflite/modelTypes';
import {
  type V13StageKey,
  v13StageFolder,
  v13TfliteBase,
} from '@/lib/camera/tflite/v13/v13Groups';

const IMAGENET_MEAN: [number, number, number] = [0.485, 0.456, 0.406];
const IMAGENET_STD: [number, number, number] = [0.229, 0.224, 0.225];

type LabelsFile = { labels: { index: number; name: string }[] };

type V13ModelEntry = {
  id: string;
  labels: readonly string[];
  modelAsset: number;
  inputSize: number;
  displayName: string;
};

function labels(meta: LabelsFile): readonly string[] {
  return labelsFromBundle(meta);
}

function buildConfig(entry: V13ModelEntry): ClassificationModelConfig {
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

const V13_MODEL_ENTRIES: Record<V13StageKey, V13ModelEntry> = {
  kingdom: {
    id: 'v13-kingdom',
    displayName: 'Kingdom',
    labels: labels(kingdomLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v13/global/step01_kingdom/tflite/kingdom.tflite'),
    inputSize: 224,
  },
  plant_router: {
    id: 'v13-plant-router',
    displayName: 'Plant router',
    labels: labels(plantRouterLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v13/global/step02_plant_router/tflite/plant_router.tflite'),
    inputSize: 240,
  },
  animal_router: {
    id: 'v13-animal-router',
    displayName: 'Animal router',
    labels: labels(animalRouterLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v13/global/step03_animal_router/tflite/animal_router.tflite'),
    inputSize: 240,
  },
  trees_shrubs: {
    id: 'v13-trees-shrubs',
    displayName: 'Trees & shrubs',
    labels: labels(treesShrubsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v13/global/trees_shrubs/tflite/trees_shrubs.tflite'),
    inputSize: 240,
  },
  wildflowers_herbs: {
    id: 'v13-wildflowers-herbs',
    displayName: 'Wildflowers & herbs',
    labels: labels(wildflowersHerbsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v13/global/wildflowers_herbs/tflite/wildflowers_herbs.tflite'),
    inputSize: 240,
  },
  ferns_mosses: {
    id: 'v13-ferns-mosses',
    displayName: 'Ferns & mosses',
    labels: labels(fernsMossesLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v13/global/ferns_mosses/tflite/ferns_mosses.tflite'),
    inputSize: 240,
  },
  coontie: {
    id: 'v13-coontie',
    displayName: 'Coontie',
    labels: labels(coontieLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v13/global/coontie/tflite/coontie.tflite'),
    inputSize: 240,
  },
  birds: {
    id: 'v13-birds',
    displayName: 'Birds',
    labels: labels(birdsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v13/global/birds/tflite/birds.tflite'),
    inputSize: 240,
  },
  herps: {
    id: 'v13-herps',
    displayName: 'Herps',
    labels: labels(herpsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v13/global/herps/tflite/herps.tflite'),
    inputSize: 240,
  },
  lepidoptera: {
    id: 'v13-lepidoptera',
    displayName: 'Lepidoptera',
    labels: labels(lepidopteraLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v13/global/lepidoptera/tflite/lepidoptera.tflite'),
    inputSize: 240,
  },
  insects: {
    id: 'v13-insects',
    displayName: 'Insects',
    labels: labels(insectsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v13/global/insects/tflite/insects.tflite'),
    inputSize: 240,
  },
  arachnids: {
    id: 'v13-arachnids',
    displayName: 'Arachnids',
    labels: labels(arachnidsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v13/global/arachnids/tflite/arachnids.tflite'),
    inputSize: 240,
  },
  wild_mammals: {
    id: 'v13-wild-mammals',
    displayName: 'Wild mammals',
    labels: labels(wildMammalsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v13/global/wild_mammals/tflite/wild_mammals.tflite'),
    inputSize: 240,
  },
  domestic_mammals: {
    id: 'v13-domestic-mammals',
    displayName: 'Domestic mammals',
    labels: labels(domesticMammalsLabelsJson as LabelsFile),
    modelAsset: require('@/assets/tflite/v13/global/domestic_mammals/tflite/domestic_mammals.tflite'),
    inputSize: 240,
  },
};

export function getV13ModelConfig(key: V13StageKey): ClassificationModelConfig {
  return buildConfig(V13_MODEL_ENTRIES[key]);
}

export function getV13ModelAssetPath(key: V13StageKey): string {
  const folder = v13StageFolder(key);
  const tfliteBase = v13TfliteBase(key);
  return `v13/global/${folder}/tflite/${tfliteBase}.tflite`;
}
