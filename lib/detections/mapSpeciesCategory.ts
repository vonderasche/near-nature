import type { ClassificationResult } from '@/types';

/** Matches `species_category` enum in `sql/create_detections.sql`. */
export type SpeciesCategoryDb =
  | 'mammal'
  | 'reptile'
  | 'fish'
  | 'insect'
  | 'bird'
  | 'plant_tree'
  | 'plant_flower'
  | 'plant_other'
  | 'amphibian'
  | 'other';

/**
 * Maps Claude vision `taxonGroup` labels into the Postgres enum used by `detections.category`.
 */
export function classificationToSpeciesCategory(c: ClassificationResult): SpeciesCategoryDb {
  switch (c.taxonGroup) {
    case 'birds':
      return 'bird';
    case 'plants':
      return 'plant_other';
    case 'fungi':
      return 'other';
    case 'animals':
      return 'other';
    default:
      return 'other';
  }
}
