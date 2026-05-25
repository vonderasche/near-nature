/**
 * Species subcategories for identification + gallery filters.
 * Canonical taxonomy: constants/naturalist-categories.ts
 */

import {
  MAIN_CATEGORIES,
  type SubcategoryId,
  getSubcategoryLabel as getNaturalistSubcategoryLabel,
} from '@/constants/naturalist-categories';

export type SpeciesSubcategoryGroup = 'animal' | 'plant';

export type AnimalSubcategoryId = Extract<
  SubcategoryId,
  | 'lizards'
  | 'snakes'
  | 'frogs_toads'
  | 'turtles_tortoises'
  | 'salamanders'
  | 'songbirds'
  | 'raptors'
  | 'wading_birds'
  | 'waterfowl'
  | 'shorebirds'
  | 'small_mammals'
  | 'deer_hoofed'
  | 'bats'
  | 'marine_mammals'
  | 'carnivores'
>;

export type PlantSubcategoryId = Extract<
  SubcategoryId,
  'wildflowers' | 'trees_shrubs' | 'ferns_mosses'
>;

export type SpeciesSubcategoryId = AnimalSubcategoryId | PlantSubcategoryId;

export type SpeciesSubcategoryOption = {
  id: SpeciesSubcategoryId;
  label: string;
  group: SpeciesSubcategoryGroup;
};

const BOTANIST = MAIN_CATEGORIES.find((m) => m.id === 'botanist')!;
const HERP = MAIN_CATEGORIES.find((m) => m.id === 'herpetologist')!;
const ORNITH = MAIN_CATEGORIES.find((m) => m.id === 'ornithologist')!;
const MAMMAL = MAIN_CATEGORIES.find((m) => m.id === 'mammalogist')!;

function options(
  ids: readonly SpeciesSubcategoryId[],
  group: SpeciesSubcategoryGroup,
): SpeciesSubcategoryOption[] {
  return ids.map((id) => ({
    id,
    label: getNaturalistSubcategoryLabel(id),
    group,
  }));
}

export const PLANT_SUBCATEGORIES = options(
  BOTANIST.subcategoryIds as readonly PlantSubcategoryId[],
  'plant',
);

export const ANIMAL_SUBCATEGORIES: readonly SpeciesSubcategoryOption[] = [
  ...options(HERP.subcategoryIds as readonly AnimalSubcategoryId[], 'animal'),
  ...options(ORNITH.subcategoryIds as readonly AnimalSubcategoryId[], 'animal'),
  ...options(MAMMAL.subcategoryIds as readonly AnimalSubcategoryId[], 'animal'),
];

export const ALL_SPECIES_SUBCATEGORIES: readonly SpeciesSubcategoryOption[] = [
  ...ANIMAL_SUBCATEGORIES,
  ...PLANT_SUBCATEGORIES,
];

const SUBCATEGORY_BY_ID = new Map(
  ALL_SPECIES_SUBCATEGORIES.map((option) => [option.id, option] as const),
);

export function getSpeciesSubcategoryLabel(id: string): string {
  return SUBCATEGORY_BY_ID.get(id as SpeciesSubcategoryId)?.label ?? getNaturalistSubcategoryLabel(id);
}

export function isSpeciesSubcategoryId(id: string): id is SpeciesSubcategoryId {
  return SUBCATEGORY_BY_ID.has(id as SpeciesSubcategoryId);
}

export function speciesSubcategoryGroup(id: string): SpeciesSubcategoryGroup | null {
  return SUBCATEGORY_BY_ID.get(id as SpeciesSubcategoryId)?.group ?? legacyCategoryGroup(id);
}

export function animalSubcategoryIdsForPrompt(): string {
  return ANIMAL_SUBCATEGORIES.map((o) => o.id).join(' | ');
}

export function plantSubcategoryIdsForPrompt(): string {
  return PLANT_SUBCATEGORIES.map((o) => o.id).join(' | ');
}

function legacyCategoryGroup(id: string): SpeciesSubcategoryGroup | null {
  if (
    id === 'mammal' ||
    id === 'reptile' ||
    id === 'fish' ||
    id === 'insect' ||
    id === 'bird' ||
    id === 'amphibian'
  ) {
    return 'animal';
  }
  if (
    id === 'plant_tree' ||
    id === 'plant_flower' ||
    id === 'plant_other' ||
    id.startsWith('plant_')
  ) {
    return 'plant';
  }
  return null;
}
