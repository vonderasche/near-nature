export type DiscoverSpeciesKind = 'plant' | 'animal';

/** Species highlight aggregated across Florida state parks. */
export type DiscoverSpeciesEntry = {
  name: string;
  imageUrl: string;
  kind: DiscoverSpeciesKind;
  parkCount: number;
  parkNames: string[];
};
