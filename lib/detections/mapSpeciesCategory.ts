import type { SubcategoryId } from '@/constants/naturalist-categories';
import { mapDbCategoryToSubcategory } from '@/lib/points/mapDbCategoryToSubcategory';
import { resolveNaturalistCategoryFromClassification } from '@/lib/points/resolveNaturalistCategory';
import type { ClassificationResult } from '@/types';

export type { SpeciesCategoryDb } from '@/lib/detections/speciesSubcategory';

/**
 * Maps vision classification into Postgres `species_category` (canonical subcategory id when possible).
 */
export function classificationToSpeciesCategory(c: ClassificationResult): string {
  const resolved = resolveNaturalistCategoryFromClassification(c);
  if (resolved) return resolved.subcategory;

  const raw = c.subcategory?.trim();
  if (raw) {
    const mapped = mapDbCategoryToSubcategory(raw);
    if (mapped) return mapped;
    return raw;
  }

  if (c.taxonGroup === 'fungi') return 'fungi';
  if (c.taxonGroup === 'birds') return 'songbirds';
  if (c.taxonGroup === 'plants') return 'wildflowers';
  return 'small_mammals';
}

/** @deprecated Prefer string return from {@link classificationToSpeciesCategory}. */
export type SpeciesCategoryFromClassification = SubcategoryId | string;
