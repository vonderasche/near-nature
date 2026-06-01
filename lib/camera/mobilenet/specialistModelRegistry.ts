import type { ModelLabelsJson } from '@/lib/camera/mobilenet/parseModelLabels';
import { buildLabelLookup } from '@/lib/camera/mobilenet/parseModelLabels';
import type { SpecialistAssetFolder, SpecialistInferenceMode } from '@/lib/camera/mobilenet/tfliteRouting';
import { TFLITE_ROUTING } from '@/lib/camera/mobilenet/tfliteRouting';

import arachnidsLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/arachnids/tflite/labels.json';
import birdsLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/birds/tflite/labels.json';
import drylandPlantsLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/dryland_plants/tflite/labels.json';
import fishLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/fish/tflite/labels.json';
import forbsFernsLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/forbs_ferns/tflite/labels.json';
import fungiLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/fungi/tflite/labels.json';
import herbaceousLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/herbaceous_plants/tflite/labels.json';
import herpsLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/herps/tflite/labels.json';
import insectsArachnidsLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/insects_arachnids/tflite/labels.json';
import insectsLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/insects/tflite/labels.json';
import mammalsLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/mammals_domestic/tflite/labels.json';
import treesLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/trees/tflite/labels.json';
import woodyLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/woody_plants/tflite/labels.json';

export type SpecialistModelDefinition = {
  assetFolder: SpecialistAssetFolder;
  displayName: string;
  model: number;
  labelLookup: readonly string[];
  inferenceMode: SpecialistInferenceMode;
};

const specialistEntries: SpecialistModelDefinition[] = [
  {
    assetFolder: 'birds',
    displayName: 'Birds',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/birds/tflite/birds_genus.tflite'),
    labelLookup: buildLabelLookup(birdsLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'fish',
    displayName: 'Fish',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/fish/tflite/fish_genus.tflite'),
    labelLookup: buildLabelLookup(fishLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'fungi',
    displayName: 'Fungi',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/fungi/tflite/fungi_genus.tflite'),
    labelLookup: buildLabelLookup(fungiLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'herbaceous_plants',
    displayName: 'Herbaceous plants',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/herbaceous_plants/tflite/herbaceous_plants_genus.tflite'),
    labelLookup: buildLabelLookup(herbaceousLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'forbs_ferns',
    displayName: 'Forbs & ferns',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/forbs_ferns/tflite/forbs_ferns_genus.tflite'),
    labelLookup: buildLabelLookup(forbsFernsLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'dryland_plants',
    displayName: 'Dryland plants',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/dryland_plants/tflite/dryland_plants_genus.tflite'),
    labelLookup: buildLabelLookup(drylandPlantsLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'herps',
    displayName: 'Reptiles & amphibians',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/herps/tflite/herps_genus.tflite'),
    labelLookup: buildLabelLookup(herpsLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'insects_arachnids',
    displayName: 'Insects & arachnids',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/insects_arachnids/tflite/insects_arachnids_genus.tflite'),
    labelLookup: buildLabelLookup(insectsArachnidsLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'insects',
    displayName: 'Insects',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/insects/tflite/insects_genus.tflite'),
    labelLookup: buildLabelLookup(insectsLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'arachnids',
    displayName: 'Arachnids',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/arachnids/tflite/arachnids_genus.tflite'),
    labelLookup: buildLabelLookup(arachnidsLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'mammals_domestic',
    displayName: 'Domestic mammals',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/mammals_domestic/tflite/mammals_domestic_genus.tflite'),
    labelLookup: buildLabelLookup(mammalsLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'trees',
    displayName: 'Trees',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/trees/tflite/trees_genus.tflite'),
    labelLookup: buildLabelLookup(treesLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'woody_plants',
    displayName: 'Shrubs & woody plants',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/woody_plants/tflite/woody_plants_genus.tflite'),
    labelLookup: buildLabelLookup(woodyLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
];

for (const specialist of TFLITE_ROUTING.specialists) {
  const entry = specialistEntries.find((row) => row.assetFolder === specialist.id);
  if (entry) entry.displayName = specialist.title;
}

export const SPECIALIST_MODELS: Record<SpecialistAssetFolder, SpecialistModelDefinition> =
  Object.fromEntries(specialistEntries.map((entry) => [entry.assetFolder, entry])) as Record<
    SpecialistAssetFolder,
    SpecialistModelDefinition
  >;

export function getSpecialistDefinition(
  assetFolder: SpecialistAssetFolder,
): SpecialistModelDefinition | undefined {
  return SPECIALIST_MODELS[assetFolder];
}
