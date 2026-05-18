import type { SubcategoryId } from '@/constants/naturalist-categories';
import { resolveNaturalistCategoryFromClassification } from '@/lib/points/resolveNaturalistCategory';
import type { ClassificationResult } from '@/types';

export type { SpeciesCategoryDb } from '@/lib/detections/speciesSubcategory';

/**
 * Maps vision classification into Postgres `species_category` (canonical subcategory id).
 */
export function classificationToSpeciesCategory(c: ClassificationResult): SubcategoryId {
  return resolveNaturalistCategoryFromClassification(c).subcategory;
}
