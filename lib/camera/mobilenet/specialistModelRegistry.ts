import type { ModelLabelsJson } from '@/lib/camera/mobilenet/parseModelLabels';
import { buildLabelLookup } from '@/lib/camera/mobilenet/parseModelLabels';
import type { SpecialistModelId } from '@/lib/camera/mobilenet/previewToSpecialist';
import { SPECIALIST_DISPLAY_NAMES } from '@/lib/camera/mobilenet/previewToSpecialist';

import birdsLabels from '@/assets/tflite/models/birds_species/tflite/labels.json';
import fishLabels from '@/assets/tflite/models/fish/tflite/labels.json';
import fungiLabels from '@/assets/tflite/models/fungi/tflite/labels.json';
import herbaceousLabels from '@/assets/tflite/models/herbaceous_plants/tflite/labels.json';
import insectsLabels from '@/assets/tflite/models/insects_arachnids/tflite/labels.json';
import mammalsLabels from '@/assets/tflite/models/mammals_domestic/tflite/labels.json';
import treesLabels from '@/assets/tflite/models/trees/tflite/labels.json';
import woodyLabels from '@/assets/tflite/models/woody_plants/tflite/labels.json';

export type SpecialistModelDefinition = {
  id: SpecialistModelId;
  displayName: string;
  model: number;
  labelLookup: readonly string[];
};

const specialistEntries: SpecialistModelDefinition[] = [
  {
    id: 'birds_species',
    displayName: SPECIALIST_DISPLAY_NAMES.birds_species,
    model: require('@/assets/tflite/models/birds_species/tflite/birds_species.tflite'),
    labelLookup: buildLabelLookup(birdsLabels as ModelLabelsJson),
  },
  {
    id: 'fish',
    displayName: SPECIALIST_DISPLAY_NAMES.fish,
    model: require('@/assets/tflite/models/fish/tflite/fish_genus.tflite'),
    labelLookup: buildLabelLookup(fishLabels as ModelLabelsJson),
  },
  {
    id: 'fungi',
    displayName: SPECIALIST_DISPLAY_NAMES.fungi,
    model: require('@/assets/tflite/models/fungi/tflite/fungi_genus.tflite'),
    labelLookup: buildLabelLookup(fungiLabels as ModelLabelsJson),
  },
  {
    id: 'herbaceous_plants',
    displayName: SPECIALIST_DISPLAY_NAMES.herbaceous_plants,
    model: require('@/assets/tflite/models/herbaceous_plants/tflite/herbaceous_plants_genus.tflite'),
    labelLookup: buildLabelLookup(herbaceousLabels as ModelLabelsJson),
  },
  {
    id: 'insects_arachnids',
    displayName: SPECIALIST_DISPLAY_NAMES.insects_arachnids,
    model: require('@/assets/tflite/models/insects_arachnids/tflite/insects_arachnids_genus.tflite'),
    labelLookup: buildLabelLookup(insectsLabels as ModelLabelsJson),
  },
  {
    id: 'mammals_domestic',
    displayName: SPECIALIST_DISPLAY_NAMES.mammals_domestic,
    model: require('@/assets/tflite/models/mammals_domestic/tflite/mammals_domestic_genus.tflite'),
    labelLookup: buildLabelLookup(mammalsLabels as ModelLabelsJson),
  },
  {
    id: 'trees',
    displayName: SPECIALIST_DISPLAY_NAMES.trees,
    model: require('@/assets/tflite/models/trees/tflite/trees_genus.tflite'),
    labelLookup: buildLabelLookup(treesLabels as ModelLabelsJson),
  },
  {
    id: 'woody_plants',
    displayName: SPECIALIST_DISPLAY_NAMES.woody_plants,
    model: require('@/assets/tflite/models/woody_plants/tflite/woody_plants_genus.tflite'),
    labelLookup: buildLabelLookup(woodyLabels as ModelLabelsJson),
  },
];

export const SPECIALIST_MODELS: Record<SpecialistModelId, SpecialistModelDefinition> =
  Object.fromEntries(specialistEntries.map((entry) => [entry.id, entry])) as Record<
    SpecialistModelId,
    SpecialistModelDefinition
  >;

export function getSpecialistDefinition(
  id: SpecialistModelId,
): SpecialistModelDefinition | undefined {
  return SPECIALIST_MODELS[id];
}
