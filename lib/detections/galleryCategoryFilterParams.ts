import type { GalleryCategoryFilter } from '@/lib/detections/filterDetectionGalleryItems';
import type { SpeciesSubcategoryGroup } from '@/constants/species-subcategories';

export type GalleryListFilterParams = {
  filterGroup: SpeciesSubcategoryGroup | null;
  filterSubcategory: string | null;
};

/** Maps UI gallery filter to `search_user_detections` RPC params. */
export function toGalleryListFilterParams(filter: GalleryCategoryFilter): GalleryListFilterParams {
  if (filter.kind === 'all') {
    return { filterGroup: null, filterSubcategory: null };
  }
  if (filter.kind === 'group') {
    return { filterGroup: filter.group, filterSubcategory: null };
  }
  return { filterGroup: null, filterSubcategory: filter.subcategory };
}
