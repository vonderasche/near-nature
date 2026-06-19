import sceneGateLabelsJson from '@/assets/tflite/trained_v3/step01_scene_gate/tflite/labels.json';
import kingdomLabelsJson from '@/assets/tflite/trained_v3/_smoke_step02_kingdom/tflite/labels.json';
import plantRouterLabelsJson from '@/assets/tflite/trained_v3/step03_plant_router/tflite/labels.json';
import treesShrubsLabelsJson from '@/assets/tflite/trained_v3/step05_specialists/trees_shrubs/tflite/labels.json';
import fernsMossesLabelsJson from '@/assets/tflite/trained_v3/step05_specialists/ferns_mosses/tflite/labels.json';
import drylandPlantsLabelsJson from '@/assets/tflite/trained_v3/step05_specialists/dryland_plants/tflite/labels.json';
import herbaceousLabelsJson from '@/assets/tflite/trained_v3/step05_specialists/herbaceous/tflite/labels.json';
import fungiLabelsJson from '@/assets/tflite/trained_v3/step05_specialists/fungi/tflite/labels.json';

import type { ImageNormalization } from '@/lib/camera/tflite/modelTypes';
import {
  MOBILENET_PREVIEW_IMAGENET_MEAN,
  MOBILENET_PREVIEW_IMAGENET_STD,
} from '@/lib/camera/mobilenet/modelConfig';

type LabelsBundle = {
  labels: { index: number; name: string }[];
};

export const V3_IMAGENET_NORM: ImageNormalization = {
  mean: [...MOBILENET_PREVIEW_IMAGENET_MEAN] as [number, number, number],
  std: [...MOBILENET_PREVIEW_IMAGENET_STD] as [number, number, number],
};

/** training_pipeline_v3/experiments/cascades/v3_full.json → steps.01_scene_gate.organismThreshold */
export const V3_SCENE_GATE_ORGANISM_THRESHOLD = 0.7;

/** training_pipeline_v3/config/pipeline.json */
export const V3_KINGDOM_TOP1_THRESHOLD = 0.65;
export const V3_PLANT_ROUTER_TOP1_THRESHOLD = 0.6;

export const V3_INPUT_224 = 224;
export const V3_INPUT_240 = 240;
export const V3_B1_RESIZE_SHORT_EDGE = 255;

export const V3_SCENE_GATE_LABELS = labelsFromBundle(sceneGateLabelsJson as LabelsBundle);
export const V3_KINGDOM_LABELS = labelsFromBundle(kingdomLabelsJson as LabelsBundle);
export const V3_PLANT_ROUTER_LABELS = labelsFromBundle(plantRouterLabelsJson as LabelsBundle);

export const V3_ORGANISM_LABEL = 'organism';
export const V3_NOT_ORGANISM_LABEL = 'not_organism';

export const V3_PLANT_SPECIALIST_GROUPS = [
  'trees_shrubs',
  'herbaceous',
  'ferns_mosses',
  'dryland_plants',
] as const;
export type V3PlantSpecialistGroup = (typeof V3_PLANT_SPECIALIST_GROUPS)[number];

export const V3_SPECIALIST_LABELS: Record<V3PlantSpecialistGroup | 'fungi', readonly string[]> = {
  trees_shrubs: labelsFromBundle(treesShrubsLabelsJson as LabelsBundle),
  herbaceous: labelsFromBundle(herbaceousLabelsJson as LabelsBundle),
  ferns_mosses: labelsFromBundle(fernsMossesLabelsJson as LabelsBundle),
  dryland_plants: labelsFromBundle(drylandPlantsLabelsJson as LabelsBundle),
  fungi: labelsFromBundle(fungiLabelsJson as LabelsBundle),
};

export const V3_MODEL_ASSETS = {
  sceneGate: require('@/assets/tflite/trained_v3/step01_scene_gate/tflite/scene_gate.tflite'),
  kingdom: require('@/assets/tflite/trained_v3/_smoke_step02_kingdom/tflite/kingdom.tflite'),
  plantRouter: require('@/assets/tflite/trained_v3/step03_plant_router/tflite/plant_router.tflite'),
  specialists: {
    trees_shrubs: require('@/assets/tflite/trained_v3/step05_specialists/trees_shrubs/tflite/trees_shrubs.tflite'),
    herbaceous: require('@/assets/tflite/trained_v3/step05_specialists/herbaceous/tflite/herbaceous.tflite'),
    ferns_mosses: require('@/assets/tflite/trained_v3/step05_specialists/ferns_mosses/tflite/ferns_mosses.tflite'),
    dryland_plants: require('@/assets/tflite/trained_v3/step05_specialists/dryland_plants/tflite/dryland_plants.tflite'),
    fungi: require('@/assets/tflite/trained_v3/step05_specialists/fungi/tflite/fungi.tflite'),
  },
} as const;

export const V3_SPECIALIST_DISPLAY_NAMES: Record<V3PlantSpecialistGroup | 'fungi', string> = {
  trees_shrubs: 'Trees & shrubs',
  herbaceous: 'Herbaceous plants',
  ferns_mosses: 'Ferns & mosses',
  dryland_plants: 'Dryland plants',
  fungi: 'Fungi',
};

function labelsFromBundle(bundle: LabelsBundle): string[] {
  return [...bundle.labels]
    .sort((a, b) => a.index - b.index)
    .map((entry) => entry.name);
}

export function isV3PlantSpecialistAvailable(group: string): group is V3PlantSpecialistGroup {
  return (V3_PLANT_SPECIALIST_GROUPS as readonly string[]).includes(group);
}
