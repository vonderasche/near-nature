import birdsMeta from './birds/tflite/labels.json';
import fishMeta from './fish/tflite/labels.json';
import fungiMeta from './fungi/tflite/labels.json';
import herbaceousPlantsMeta from './herbaceous_plants/tflite/labels.json';
import herpsMeta from './herps/tflite/labels.json';
import insectsArachnidsMeta from './insects_arachnids/tflite/labels.json';
import insectsMeta from './insects/tflite/labels.json';
import arachnidsMeta from './arachnids/tflite/labels.json';
import mammalsDomesticMeta from './mammals_domestic/tflite/labels.json';
import treesMeta from './trees/tflite/labels.json';
import woodyPlantsMeta from './woody_plants/tflite/labels.json';
import forbsFernsMeta from './forbs_ferns/tflite/labels.json';
import drylandPlantsMeta from './dryland_plants/tflite/labels.json';
import routing from './routing.json';
import { ClassificationModelConfig } from '../types';

const IMAGENET_MEAN: [number, number, number] = [0.485, 0.456, 0.406];
const IMAGENET_STD: [number, number, number] = [0.229, 0.224, 0.225];

/**
 * Specialists that this app can actually load (bundled .tflite + labels).
 * IDs not included here should be handled by routing fallback.
 */
export const SPECIALIST_IDS = [
  'trees',
  'woody_plants',
  'herbaceous_plants',
  'forbs_ferns',
  'dryland_plants',
  'birds',
  'herps',
  'insects_arachnids',
  'insects',
  'arachnids',
  'fish',
  'fungi',
  'mammals_domestic',
] as const;

export type SpecialistId = (typeof SPECIALIST_IDS)[number];

type LabelsFile = {
  labels: { index: number; name: string }[];
};

function labelsFromMeta(meta: LabelsFile): string[] {
  return meta.labels.map((entry) => entry.name);
}

const specialistTitles = Object.fromEntries(
  routing.specialists.map((entry) => [entry.id, entry.title])
) as Record<string, string>;

const base = {
  task: 'classification' as const,
  input: {
    width: 224,
    height: 224,
    pixelFormat: 'rgb' as const,
    dataType: 'float32' as const,
    normalization: { mean: IMAGENET_MEAN, std: IMAGENET_STD },
  },
  targetFps: 1,
  topK: 3,
  outputType: 'float' as const,
  confidenceMode: 'softmax' as const,
  directLabelIndex: true,
};

function specialistModel(
  id: SpecialistId,
  labels: string[],
  model: number
): ClassificationModelConfig {
  return {
    ...base,
    id: `inat-${id}`,
    name: specialistTitles[id] ?? id,
    labels,
    model,
  };
}

export const specialistModels: Record<SpecialistId, ClassificationModelConfig> = {
  trees: specialistModel('trees', labelsFromMeta(treesMeta), require('./trees/tflite/trees_genus.tflite')),
  woody_plants: specialistModel(
    'woody_plants',
    labelsFromMeta(woodyPlantsMeta),
    require('./woody_plants/tflite/woody_plants_genus.tflite')
  ),
  herbaceous_plants: specialistModel(
    'herbaceous_plants',
    labelsFromMeta(herbaceousPlantsMeta),
    require('./herbaceous_plants/tflite/herbaceous_plants_genus.tflite')
  ),
  forbs_ferns: specialistModel(
    'forbs_ferns',
    labelsFromMeta(forbsFernsMeta),
    require('./forbs_ferns/tflite/forbs_ferns_genus.tflite')
  ),
  dryland_plants: specialistModel(
    'dryland_plants',
    labelsFromMeta(drylandPlantsMeta),
    require('./dryland_plants/tflite/dryland_plants_genus.tflite')
  ),
  birds: specialistModel('birds', labelsFromMeta(birdsMeta), require('./birds/tflite/birds_genus.tflite')),
  herps: specialistModel('herps', labelsFromMeta(herpsMeta), require('./herps/tflite/herps_genus.tflite')),
  insects_arachnids: specialistModel(
    'insects_arachnids',
    labelsFromMeta(insectsArachnidsMeta),
    require('./insects_arachnids/tflite/insects_arachnids_genus.tflite')
  ),
  insects: specialistModel('insects', labelsFromMeta(insectsMeta), require('./insects/tflite/insects_genus.tflite')),
  arachnids: specialistModel(
    'arachnids',
    labelsFromMeta(arachnidsMeta),
    require('./arachnids/tflite/arachnids_genus.tflite')
  ),
  fish: specialistModel('fish', labelsFromMeta(fishMeta), require('./fish/tflite/fish_genus.tflite')),
  fungi: specialistModel('fungi', labelsFromMeta(fungiMeta), require('./fungi/tflite/fungi_genus.tflite')),
  mammals_domestic: specialistModel(
    'mammals_domestic',
    labelsFromMeta(mammalsDomesticMeta),
    require('./mammals_domestic/tflite/mammals_domestic_genus.tflite')
  ),
};

export function isSpecialistAvailable(specialistId: string): specialistId is SpecialistId {
  return SPECIALIST_IDS.includes(specialistId as SpecialistId);
}

export function getSpecialistModelConfig(
  specialistId: SpecialistId
): ClassificationModelConfig {
  return specialistModels[specialistId];
}

export function getSpecialistDisplayName(specialistId: SpecialistId): string {
  return specialistModels[specialistId].name;
}

