import { detectionCategoryMatchesSubcategoryFilter } from '@/lib/detections/detectionCategoryTaxonFilter';
import { detectionSearchFields } from '@/lib/detections/detectionSearchFields';
import { speciesCategoryMatchesGroup } from '@/lib/detections/speciesSubcategory';
import { matchesSearchInFields } from '@/lib/search/matchesSearchQuery';
import type { SpeciesSubcategoryId } from '@/constants/species-subcategories';
import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';
import type { DetectionGalleryItem } from '@/types';
import type { SpeciesSubcategoryGroup } from '@/constants/species-subcategories';

function rowToSearchShape(row: DetectionGalleryRow) {
  return {
    commonName: row.common_name,
    latinName: row.latin_name,
    description: row.description,
    category: row.category,
    subcategory: row.subcategory ?? null,
    mainCategory: row.main_category ?? null,
  };
}

export type GalleryCategoryFilter =
  | { kind: 'all' }
  | { kind: 'group'; group: SpeciesSubcategoryGroup }
  | { kind: 'subcategory'; subcategory: SpeciesSubcategoryId };

/** Matches names, taxonomy labels, normalized Latin/genus, description, and optional aliases. */
export function filterDetectionGalleryItems(
  items: readonly DetectionGalleryItem[],
  query: string,
  categoryFilter: GalleryCategoryFilter = { kind: 'all' },
  aliasesByLatinName?: ReadonlyMap<string, readonly string[]>,
): DetectionGalleryItem[] {
  const trimmed = query.trim();

  return items.filter((item) => {
    const aliases = aliasesByLatinName?.get(item.latinName.trim().toLowerCase()) ?? [];
    if (trimmed && !matchesSearchInFields(detectionSearchFields(item, aliases), trimmed)) {
      return false;
    }
    if (categoryFilter.kind === 'all') return true;
    if (categoryFilter.kind === 'group') {
      return speciesCategoryMatchesGroup(item.category, categoryFilter.group);
    }
    return detectionCategoryMatchesSubcategoryFilter(item.category, categoryFilter.subcategory);
  });
}

/** Text + category filter on gallery DB rows (local mode / RPC fallback). */
export function filterDetectionGalleryRows(
  rows: readonly DetectionGalleryRow[],
  query: string,
  aliasesByLatinName?: ReadonlyMap<string, readonly string[]>,
  categoryFilter: GalleryCategoryFilter = { kind: 'all' },
): DetectionGalleryRow[] {
  const trimmed = query.trim();

  return rows.filter((row) => {
    const aliases = aliasesByLatinName?.get(row.latin_name.trim().toLowerCase()) ?? [];
    if (trimmed && !matchesSearchInFields(detectionSearchFields(rowToSearchShape(row), aliases), trimmed)) {
      return false;
    }
    if (categoryFilter.kind === 'all') return true;
    if (categoryFilter.kind === 'group') {
      return speciesCategoryMatchesGroup(row.category, categoryFilter.group);
    }
    return detectionCategoryMatchesSubcategoryFilter(row.category, categoryFilter.subcategory);
  });
}
