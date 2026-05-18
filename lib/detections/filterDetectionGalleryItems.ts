import { detectionCategoryMatchesSubcategoryFilter } from '@/lib/detections/detectionCategoryTaxonFilter';
import { speciesCategoryMatchesGroup } from '@/lib/detections/speciesSubcategory';
import { matchesSearchInFields } from '@/lib/search/matchesSearchQuery';
import type { SpeciesSubcategoryId } from '@/constants/species-subcategories';
import type { DetectionGalleryItem } from '@/types';
import type { SpeciesSubcategoryGroup } from '@/constants/species-subcategories';

export type GalleryCategoryFilter =
  | { kind: 'all' }
  | { kind: 'group'; group: SpeciesSubcategoryGroup }
  | { kind: 'subcategory'; subcategory: SpeciesSubcategoryId };

/** Matches common name, scientific (Latin) name, and saved description on gallery rows. */
export function filterDetectionGalleryItems(
  items: readonly DetectionGalleryItem[],
  query: string,
  categoryFilter: GalleryCategoryFilter = { kind: 'all' },
): DetectionGalleryItem[] {
  const trimmed = query.trim();

  return items.filter((item) => {
    if (trimmed && !matchesSearchInFields([item.commonName, item.latinName, item.description], trimmed)) {
      return false;
    }
    if (categoryFilter.kind === 'all') return true;
    if (categoryFilter.kind === 'group') {
      return speciesCategoryMatchesGroup(item.category, categoryFilter.group);
    }
    return detectionCategoryMatchesSubcategoryFilter(item.category, categoryFilter.subcategory);
  });
}
