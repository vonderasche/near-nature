import {
  getSubcategory,
  type MainCategoryId,
  type SubcategoryId,
} from '@/constants/naturalist-categories';
import { mapDbCategoryToSubcategory } from '@/lib/points/mapDbCategoryToSubcategory';
import type { ClassificationResult, VisionTaxonGroup } from '@/types';

export type ResolvedNaturalistCategory = {
  subcategory: SubcategoryId;
  mainCategory: MainCategoryId;
};

/** Maps a stored `detections.category` (legacy or canonical) to badge taxonomy. */
export function resolveNaturalistCategoryFromDb(
  category: string,
): ResolvedNaturalistCategory | null {
  const subcategory = mapDbCategoryToSubcategory(category);
  if (!subcategory) return null;
  return { subcategory, mainCategory: getSubcategory(subcategory).mainId };
}

function defaultSubcategoryForTaxon(taxonGroup: VisionTaxonGroup): SubcategoryId {
  switch (taxonGroup) {
    case 'birds':
      return 'songbirds';
    case 'plants':
      return 'wildflowers';
    case 'fungi':
      return 'other_fungi';
    case 'animals':
      return 'small_mammals';
  }
}

/** Resolves vision output to canonical subcategory + main discipline for scoring. */
export function resolveNaturalistCategoryFromClassification(
  classification: ClassificationResult,
): ResolvedNaturalistCategory {
  const raw = classification.subcategory?.trim();
  const mapped = raw ? mapDbCategoryToSubcategory(raw) : null;
  const subcategory = mapped ?? defaultSubcategoryForTaxon(classification.taxonGroup);
  return { subcategory, mainCategory: getSubcategory(subcategory).mainId };
}
