import sceneGateLabelsJson from '@/assets/tflite/trained_v4/step01_scene_gate/tflite/labels.json';
import kingdomLabelsJson from '@/assets/tflite/trained_v4/step02_kingdom/tflite/labels.json';

import {
  MOBILENET_PREVIEW_IMAGENET_MEAN,
  MOBILENET_PREVIEW_IMAGENET_STD,
} from '@/lib/camera/mobilenet/modelConfig';
import type { ImageNormalization } from '@/lib/camera/tflite/modelTypes';

type LabelsBundle = {
  labels: { index: number; name: string }[];
};

/** python/training/v3/experiments/cascades/mvp_capture.json */
export const MVP_SCENE_GATE_ORGANISM_MAYBE_THRESHOLD = 0.45;
export const MVP_SCENE_GATE_ORGANISM_THRESHOLD = 0.7;

/** Kingdom preview threshold for plantae|animalia|fungi top-1. */
export const MVP_KINGDOM_TOP1_THRESHOLD = 0.65;

export const MVP_INPUT_224 = 224;
export const MVP_INPUT_240 = 240;
export const MVP_B1_RESIZE_SHORT_EDGE = 255;

export const MVP_IMAGENET_NORM: ImageNormalization = {
  mean: [...MOBILENET_PREVIEW_IMAGENET_MEAN] as [number, number, number],
  std: [...MOBILENET_PREVIEW_IMAGENET_STD] as [number, number, number],
};

export const MVP_SCENE_GATE_LABELS = labelsFromBundle(sceneGateLabelsJson as LabelsBundle);
export const MVP_KINGDOM_LABELS = labelsFromBundle(kingdomLabelsJson as LabelsBundle);
export const MVP_ORGANISM_LABEL = 'organism';
export const MVP_NOT_ORGANISM_LABEL = 'not_organism';

/** Specialist group ids shared with v3 taxonomy mapping (capture uses legacy v2 models). */
export const MVP_SPECIALIST_GROUPS = [
  'birds',
  'dryland_plants',
  'ferns_mosses',
  'fish',
  'fungi',
  'herbaceous',
  'herps',
  'insects_arachnids',
  'lepidoptera',
  'mammals',
  'trees_shrubs',
] as const;

export type MvpSpecialistGroup = (typeof MVP_SPECIALIST_GROUPS)[number];

export const MVP_MODEL_ASSETS = {
  sceneGate: require('@/assets/tflite/trained_v4/step01_scene_gate/tflite/scene_gate.tflite'),
  kingdom: require('@/assets/tflite/trained_v4/step02_kingdom/tflite/kingdom.tflite'),
} as const;

function labelsFromBundle(bundle: LabelsBundle): string[] {
  return [...bundle.labels]
    .sort((a, b) => a.index - b.index)
    .map((entry) => entry.name);
}

export function formatMvpSceneGatePreviewLabel(organismConfidence: number): string {
  if (organismConfidence < MVP_SCENE_GATE_ORGANISM_MAYBE_THRESHOLD) {
    return 'Searching…';
  }
  if (organismConfidence < MVP_SCENE_GATE_ORGANISM_THRESHOLD) {
    return 'Maybe…';
  }
  return 'Subject found';
}
