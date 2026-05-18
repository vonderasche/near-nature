import {
  coerceAnimalSubcategory,
  coercePlantSubcategory,
  type SpeciesCategoryDb,
} from '@/lib/detections/speciesSubcategory';
import type { ClassificationResult } from '@/types';

/**
 * Maps vision classification into Postgres `species_category`.
 * Prefers explicit `subcategory` from the model; falls back to broad taxon labels.
 */
export function classificationToSpeciesCategory(c: ClassificationResult): SpeciesCategoryDb {
  const animal = coerceAnimalSubcategory(c.subcategory);
  if (animal) return animal;

  const plant = coercePlantSubcategory(c.subcategory);
  if (plant) return plant;

  switch (c.taxonGroup) {
    case 'birds':
      return 'songbirds';
    case 'plants':
      return 'wildflowers';
    case 'fungi':
      return 'other';
    case 'animals':
      return 'small_mammals';
    default:
      return 'other';
  }
}

export type { SpeciesCategoryDb } from '@/lib/detections/speciesSubcategory';
