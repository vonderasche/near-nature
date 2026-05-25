import {
  type AnimalSubcategoryId,
  type PlantSubcategoryId,
  type SpeciesSubcategoryGroup,
  type SpeciesSubcategoryId,
  isSpeciesSubcategoryId,
  speciesSubcategoryGroup,
} from '@/constants/species-subcategories';
import { mapDbCategoryToSubcategory } from '@/lib/points/mapDbCategoryToSubcategory';
import type { SubcategoryId } from '@/constants/naturalist-categories';

/** All values allowed in Postgres `species_category` (legacy + subcategories). */
export type SpeciesCategoryDb = SubcategoryId | string;

const LEGACY_TO_SUBCATEGORY: Partial<Record<string, string>> = {
  mammal: 'small_mammals',
  reptile: 'lizards',
  bird: 'songbirds',
  amphibian: 'frogs_toads',
  plant_tree: 'trees_shrubs',
  plant_flower: 'wildflowers',
  plant_other: 'trees_shrubs',
  flowers: 'wildflowers',
  trees: 'trees_shrubs',
  shrubs: 'trees_shrubs',
  ferns: 'ferns_mosses',
  mosses_lichens: 'ferns_mosses',
  grasses_sedges: 'wildflowers',
  vines: 'trees_shrubs',
  succulents_cacti: 'cacti_succulents',
};

export function normalizeSpeciesCategoryDb(value: string): string {
  const trimmed = value.trim();
  const mapped = mapDbCategoryToSubcategory(trimmed);
  if (mapped) return mapped;
  if (isSpeciesSubcategoryId(trimmed)) return trimmed;
  return trimmed in LEGACY_TO_SUBCATEGORY ? LEGACY_TO_SUBCATEGORY[trimmed]! : trimmed;
}

export function speciesCategoryMatchesGroup(
  category: string,
  group: SpeciesSubcategoryGroup | 'all',
): boolean {
  if (group === 'all') return true;
  const normalized = normalizeSpeciesCategoryDb(category);
  const resolvedGroup = speciesSubcategoryGroup(normalized);
  return resolvedGroup === group;
}

export function speciesCategoryMatchesSubcategory(
  category: string,
  subcategory: SpeciesSubcategoryId | 'all',
): boolean {
  if (subcategory === 'all') return true;
  const normalized = normalizeSpeciesCategoryDb(category);
  return normalized === subcategory;
}

export function coerceAnimalSubcategory(value: string | undefined): AnimalSubcategoryId | null {
  if (!value) return null;
  const mapped = mapDbCategoryToSubcategory(value);
  if (mapped && speciesSubcategoryGroup(mapped) === 'animal') {
    return mapped as AnimalSubcategoryId;
  }
  return null;
}

export function coercePlantSubcategory(value: string | undefined): PlantSubcategoryId | null {
  if (!value) return null;
  const mapped = mapDbCategoryToSubcategory(value);
  if (mapped && speciesSubcategoryGroup(mapped) === 'plant') {
    return mapped as PlantSubcategoryId;
  }
  return null;
}
