import {
  speciesCategoryMatchesGroup,
  speciesCategoryMatchesSubcategory,
} from '@/lib/detections/speciesSubcategory';
import type { SpeciesSubcategoryId } from '@/constants/species-subcategories';
import type { TaxonGroup } from '@/types';

/** Best-effort filter: DB `species_category` vs UI taxon filter. */
export function detectionCategoryMatchesTaxonGroup(category: string, taxonGroup: TaxonGroup): boolean {
  if (taxonGroup === 'all') return true;
  if (taxonGroup === 'plant') return speciesCategoryMatchesGroup(category, 'plant');
  if (taxonGroup === 'animal') return speciesCategoryMatchesGroup(category, 'animal');
  if (taxonGroup === 'fungus') return category === 'other';
  if (taxonGroup === 'other') {
    return (
      category === 'other' ||
      (!speciesCategoryMatchesGroup(category, 'plant') &&
        !speciesCategoryMatchesGroup(category, 'animal'))
    );
  }
  return true;
}

export function detectionCategoryMatchesSubcategoryFilter(
  category: string,
  subcategory: SpeciesSubcategoryId | 'all',
): boolean {
  return speciesCategoryMatchesSubcategory(category, subcategory);
}
