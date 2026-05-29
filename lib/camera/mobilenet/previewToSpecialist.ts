export type SpecialistModelId =
  | 'birds_species'
  | 'fish'
  | 'fungi'
  | 'herbaceous_plants'
  | 'insects_arachnids'
  | 'mammals_domestic'
  | 'trees'
  | 'woody_plants';

export const SPECIALIST_DISPLAY_NAMES: Record<SpecialistModelId, string> = {
  birds_species: 'Birds',
  fish: 'Freshwater fish',
  fungi: 'Fungi',
  herbaceous_plants: 'Herbaceous plants',
  insects_arachnids: 'Insects & arachnids',
  mammals_domestic: 'Mammals',
  trees: 'Trees',
  woody_plants: 'Woody plants',
};

/** Maps top-20 preview label → bundled genus specialist model (when available). */
export const PREVIEW_LABEL_TO_SPECIALIST: Record<string, SpecialistModelId | null> = {
  Tree: 'trees',
  'Shrub / Bush': 'woody_plants',
  Wildflower: 'herbaceous_plants',
  'Grass / Sedge': 'herbaceous_plants',
  Fern: 'herbaceous_plants',
  'Cactus / Succulent': 'herbaceous_plants',
  Bird: 'birds_species',
  'Reptile / Lizard': null,
  Snake: null,
  Turtle: null,
  'Frog / Amphibian': null,
  'Butterfly / Moth': 'insects_arachnids',
  'Insect (other)': 'insects_arachnids',
  'Freshwater Fish': 'fish',
  'Spider / Arachnid': 'insects_arachnids',
  Dog: 'mammals_domestic',
  Cat: 'mammals_domestic',
  'Horse / Livestock': 'mammals_domestic',
  'Fungi / Mushroom': 'fungi',
  'No Plant or Animal': null,
};

export function resolveSpecialistForPreviewLabel(
  previewLabel: string,
): SpecialistModelId | null {
  return PREVIEW_LABEL_TO_SPECIALIST[previewLabel] ?? null;
}
