import {
  ANIMAL_SUBCATEGORIES,
  PLANT_SUBCATEGORIES,
  getSpeciesSubcategoryLabel,
  type AnimalSubcategoryId,
  type PlantSubcategoryId,
} from '@/constants/species-subcategories';
import type { DiscoverSpeciesKind } from '@/types/discover-species';

/** Discover-only animal groups not in the gallery filter taxonomy. */
export type DiscoverExtraAnimalSubcategoryId = 'fish' | 'insects' | 'other_animals';

export type DiscoverAnimalSubcategoryId = AnimalSubcategoryId | DiscoverExtraAnimalSubcategoryId;

export type DiscoverExtraPlantSubcategoryId = 'aquatic_plants' | 'other_plants';

export type DiscoverPlantSubcategoryId = PlantSubcategoryId | DiscoverExtraPlantSubcategoryId;

export type DiscoverSpeciesSubcategoryId = DiscoverAnimalSubcategoryId | DiscoverPlantSubcategoryId;

export type DiscoverSpeciesSubcategoryOption = {
  id: DiscoverSpeciesSubcategoryId;
  label: string;
  group: DiscoverSpeciesKind;
};

const EXTRA_ANIMAL_SUBCATEGORIES: readonly DiscoverSpeciesSubcategoryOption[] = [
  { id: 'fish', label: 'Fish', group: 'animal' },
  { id: 'insects', label: 'Insects & spiders', group: 'animal' },
  { id: 'other_animals', label: 'Other animals', group: 'animal' },
];

const EXTRA_PLANT_SUBCATEGORIES: readonly DiscoverSpeciesSubcategoryOption[] = [
  { id: 'aquatic_plants', label: 'Aquatic plants', group: 'plant' },
  { id: 'other_plants', label: 'Other plants', group: 'plant' },
];

export const DISCOVER_ANIMAL_SUBCATEGORIES: readonly DiscoverSpeciesSubcategoryOption[] = [
  ...ANIMAL_SUBCATEGORIES.map((option) => ({ ...option, group: 'animal' as const })),
  ...EXTRA_ANIMAL_SUBCATEGORIES,
];

export const DISCOVER_PLANT_SUBCATEGORIES: readonly DiscoverSpeciesSubcategoryOption[] = [
  ...PLANT_SUBCATEGORIES.map((option) => ({ ...option, group: 'plant' as const })),
  ...EXTRA_PLANT_SUBCATEGORIES,
];

const SUBCATEGORY_BY_ID = new Map(
  [...DISCOVER_ANIMAL_SUBCATEGORIES, ...DISCOVER_PLANT_SUBCATEGORIES].map(
    (option) => [option.id, option] as const,
  ),
);

export function discoverSubcategoriesForKind(
  kind: DiscoverSpeciesKind,
): readonly DiscoverSpeciesSubcategoryOption[] {
  return kind === 'plant' ? DISCOVER_PLANT_SUBCATEGORIES : DISCOVER_ANIMAL_SUBCATEGORIES;
}

export function getDiscoverSubcategoryLabel(id: DiscoverSpeciesSubcategoryId): string {
  return SUBCATEGORY_BY_ID.get(id)?.label ?? getSpeciesSubcategoryLabel(id);
}

export function isDiscoverAnimalSubcategoryId(id: string): id is DiscoverAnimalSubcategoryId {
  return DISCOVER_ANIMAL_SUBCATEGORIES.some((option) => option.id === id);
}

export function isDiscoverPlantSubcategoryId(id: string): id is DiscoverPlantSubcategoryId {
  return DISCOVER_PLANT_SUBCATEGORIES.some((option) => option.id === id);
}
