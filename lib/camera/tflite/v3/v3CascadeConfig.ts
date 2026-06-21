import sceneGateLabelsJson from '@/assets/tflite/trained_v3/step01_scene_gate/tflite/labels.json';

import kingdomLabelsJson from '@/assets/tflite/trained_v3/_smoke_step02_kingdom/tflite/labels.json';

import plantRouterLabelsJson from '@/assets/tflite/trained_v3/step03_plant_router/tflite/labels.json';

import animalRouterLabelsJson from '@/assets/tflite/trained_v3/step04_animal_router/tflite/labels.json';

import treesShrubsLabelsJson from '@/assets/tflite/trained_v3/step05_specialists/trees_shrubs/tflite/labels.json';

import herbaceousLabelsJson from '@/assets/tflite/trained_v3/step05_specialists/herbaceous/tflite/labels.json';

import fernsMossesLabelsJson from '@/assets/tflite/trained_v3/step05_specialists/ferns_mosses/tflite/labels.json';

import drylandPlantsLabelsJson from '@/assets/tflite/trained_v3/step05_specialists/dryland_plants/tflite/labels.json';

import fungiLabelsJson from '@/assets/tflite/trained_v3/step05_specialists/fungi/tflite/labels.json';

import birdsLabelsJson from '@/assets/tflite/trained_v3/step05_specialists/birds/tflite/labels.json';

import herpsLabelsJson from '@/assets/tflite/trained_v3/step05_specialists/herps/tflite/labels.json';

import lepidopteraLabelsJson from '@/assets/tflite/trained_v3/step05_specialists/lepidoptera/tflite/labels.json';

import insectsArachnidsLabelsJson from '@/assets/tflite/trained_v3/step05_specialists/insects_arachnids/tflite/labels.json';

import fishLabelsJson from '@/assets/tflite/trained_v3/step05_specialists/fish/tflite/labels.json';

import mammalsLabelsJson from '@/assets/tflite/trained_v3/step05_specialists/mammals/tflite/labels.json';



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

export const V3_ANIMAL_ROUTER_TOP1_THRESHOLD = 0.6;



export const V3_INPUT_224 = 224;

export const V3_INPUT_240 = 240;

export const V3_B1_RESIZE_SHORT_EDGE = 255;



export const V3_SCENE_GATE_LABELS = labelsFromBundle(sceneGateLabelsJson as LabelsBundle);

export const V3_KINGDOM_LABELS = labelsFromBundle(kingdomLabelsJson as LabelsBundle);

export const V3_PLANT_ROUTER_LABELS = labelsFromBundle(plantRouterLabelsJson as LabelsBundle);

export const V3_ANIMAL_ROUTER_LABELS = labelsFromBundle(animalRouterLabelsJson as LabelsBundle);



export const V3_ORGANISM_LABEL = 'organism';

export const V3_NOT_ORGANISM_LABEL = 'not_organism';



export const V3_PLANT_SPECIALIST_GROUPS = [

  'trees_shrubs',

  'herbaceous',

  'ferns_mosses',

  'dryland_plants',

] as const;

export type V3PlantSpecialistGroup = (typeof V3_PLANT_SPECIALIST_GROUPS)[number];



export const V3_ANIMAL_SPECIALIST_GROUPS = [

  'birds',

  'herps',

  'lepidoptera',

  'insects_arachnids',

  'fish',

  'mammals',

] as const;

export type V3AnimalSpecialistGroup = (typeof V3_ANIMAL_SPECIALIST_GROUPS)[number];



export type V3SpecialistGroup = V3PlantSpecialistGroup | V3AnimalSpecialistGroup | 'fungi';



export const V3_SPECIALIST_LABELS: Record<V3SpecialistGroup, readonly string[]> = {

  trees_shrubs: labelsFromBundle(treesShrubsLabelsJson as LabelsBundle),

  herbaceous: labelsFromBundle(herbaceousLabelsJson as LabelsBundle),

  ferns_mosses: labelsFromBundle(fernsMossesLabelsJson as LabelsBundle),

  dryland_plants: labelsFromBundle(drylandPlantsLabelsJson as LabelsBundle),

  fungi: labelsFromBundle(fungiLabelsJson as LabelsBundle),

  birds: labelsFromBundle(birdsLabelsJson as LabelsBundle),

  herps: labelsFromBundle(herpsLabelsJson as LabelsBundle),

  lepidoptera: labelsFromBundle(lepidopteraLabelsJson as LabelsBundle),

  insects_arachnids: labelsFromBundle(insectsArachnidsLabelsJson as LabelsBundle),

  fish: labelsFromBundle(fishLabelsJson as LabelsBundle),

  mammals: labelsFromBundle(mammalsLabelsJson as LabelsBundle),

};



export const V3_MODEL_ASSETS = {

  sceneGate: require('@/assets/tflite/trained_v3/step01_scene_gate/tflite/scene_gate.tflite'),

  kingdom: require('@/assets/tflite/trained_v3/_smoke_step02_kingdom/tflite/kingdom.tflite'),

  plantRouter: require('@/assets/tflite/trained_v3/step03_plant_router/tflite/plant_router.tflite'),

  animalRouter: require('@/assets/tflite/trained_v3/step04_animal_router/tflite/animal_router.tflite'),

  specialists: {

    trees_shrubs: require('@/assets/tflite/trained_v3/step05_specialists/trees_shrubs/tflite/trees_shrubs.tflite'),

    herbaceous: require('@/assets/tflite/trained_v3/step05_specialists/herbaceous/tflite/herbaceous.tflite'),

    ferns_mosses: require('@/assets/tflite/trained_v3/step05_specialists/ferns_mosses/tflite/ferns_mosses.tflite'),

    dryland_plants: require('@/assets/tflite/trained_v3/step05_specialists/dryland_plants/tflite/dryland_plants.tflite'),

    fungi: require('@/assets/tflite/trained_v3/step05_specialists/fungi/tflite/fungi.tflite'),

    birds: require('@/assets/tflite/trained_v3/step05_specialists/birds/tflite/birds.tflite'),

    herps: require('@/assets/tflite/trained_v3/step05_specialists/herps/tflite/herps.tflite'),

    lepidoptera: require('@/assets/tflite/trained_v3/step05_specialists/lepidoptera/tflite/lepidoptera.tflite'),

    insects_arachnids: require('@/assets/tflite/trained_v3/step05_specialists/insects_arachnids/tflite/insects_arachnids.tflite'),

    fish: require('@/assets/tflite/trained_v3/step05_specialists/fish/tflite/fish.tflite'),

    mammals: require('@/assets/tflite/trained_v3/step05_specialists/mammals/tflite/mammals.tflite'),

  },

} as const;



export const V3_SPECIALIST_DISPLAY_NAMES: Record<V3SpecialistGroup, string> = {

  trees_shrubs: 'Trees & shrubs',

  herbaceous: 'Herbaceous plants',

  ferns_mosses: 'Ferns & mosses',

  dryland_plants: 'Dryland plants',

  fungi: 'Fungi',

  birds: 'Birds',

  herps: 'Herps',

  lepidoptera: 'Butterflies & moths',

  insects_arachnids: 'Insects & arachnids',

  fish: 'Fish',

  mammals: 'Mammals',

};



function labelsFromBundle(bundle: LabelsBundle): string[] {

  return [...bundle.labels]

    .sort((a, b) => a.index - b.index)

    .map((entry) => entry.name);

}



export function isV3PlantSpecialistAvailable(group: string): group is V3PlantSpecialistGroup {

  return (V3_PLANT_SPECIALIST_GROUPS as readonly string[]).includes(group);

}



export function isV3AnimalSpecialistAvailable(group: string): group is V3AnimalSpecialistGroup {

  return (V3_ANIMAL_SPECIALIST_GROUPS as readonly string[]).includes(group);

}


