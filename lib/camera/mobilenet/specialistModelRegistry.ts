import type { BirdsRollupManifest } from '@/lib/camera/mobilenet/birdsSpeciesRollup';
import type { ModelLabelsJson } from '@/lib/camera/mobilenet/parseModelLabels';
import { buildLabelLookup } from '@/lib/camera/mobilenet/parseModelLabels';
import type { SpecialistAssetFolder, SpecialistInferenceMode } from '@/lib/camera/mobilenet/tfliteRouting';
import { TFLITE_ROUTING } from '@/lib/camera/mobilenet/tfliteRouting';

import birdsGenusLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists/birds/genus_labels.json';
import birdsRollup from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists/birds/rollup.json';
import fishLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists/fish/labels.json';
import fungiLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists/fungi/labels.json';
import herbaceousLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists/herbaceous_plants/labels.json';
import herpsLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists/herps/labels.json';
import insectsLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists/insects_arachnids/labels.json';
import mammalsLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists/mammals_domestic/labels.json';
import treesLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists/trees/labels.json';
import woodyLabels from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists/woody_plants/labels.json';

export type SpecialistModelDefinition = {
  assetFolder: SpecialistAssetFolder;
  displayName: string;
  model: number;
  labelLookup: readonly string[];
  inferenceMode: SpecialistInferenceMode;
  rollup?: BirdsRollupManifest;
};

const specialistEntries: SpecialistModelDefinition[] = [
  {
    assetFolder: 'birds',
    displayName: 'Birds',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists/birds/birds_species.tflite'),
    labelLookup: buildLabelLookup(birdsGenusLabels as ModelLabelsJson),
    inferenceMode: 'species_rollup',
    rollup: birdsRollup as BirdsRollupManifest,
  },
  {
    assetFolder: 'fish',
    displayName: 'Fish',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists/fish/fish_genus.tflite'),
    labelLookup: buildLabelLookup(fishLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'fungi',
    displayName: 'Fungi',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists/fungi/fungi_genus.tflite'),
    labelLookup: buildLabelLookup(fungiLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'herbaceous_plants',
    displayName: 'Herbaceous plants',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists/herbaceous_plants/herbaceous_plants_genus.tflite'),
    labelLookup: buildLabelLookup(herbaceousLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'herps',
    displayName: 'Reptiles & amphibians',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists/herps/herps_genus.tflite'),
    labelLookup: buildLabelLookup(herpsLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'insects_arachnids',
    displayName: 'Insects & arachnids',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists/insects_arachnids/insects_arachnids_genus.tflite'),
    labelLookup: buildLabelLookup(insectsLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'mammals_domestic',
    displayName: 'Domestic mammals',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists/mammals_domestic/mammals_domestic_genus.tflite'),
    labelLookup: buildLabelLookup(mammalsLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'trees',
    displayName: 'Trees',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists/trees/trees_genus.tflite'),
    labelLookup: buildLabelLookup(treesLabels as ModelLabelsJson),
    inferenceMode: 'genus_direct',
  },
  {
    assetFolder: 'woody_plants',
    displayName: 'Shrubs & woody plants',
    model: require('@/assets/tflite/near_nature_app_bundle/inat2021_specialists/woody_plants/woody_plants_genus.tflite'),
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
