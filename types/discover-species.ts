import type { DiscoverSpeciesSubcategoryId } from '@/lib/discover/discoverSpeciesSubcategories';

export type DiscoverSpeciesKind = 'plant' | 'animal';

/** Species highlight aggregated across Florida state parks. */
export type DiscoverSpeciesEntry = {
  name: string;
  imageUrl: string;
  kind: DiscoverSpeciesKind;
  subcategoryId: DiscoverSpeciesSubcategoryId;
  parkCount: number;
  parkNames: string[];
};
