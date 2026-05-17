export type ExplorePark = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  county: string;
  state: string;
  description: string | null;
  websiteUrl: string | null;
  imageUrl: string | null;
  totalSpecies: number;
  birdCount: number;
  mammalCount: number;
  reptileCount: number;
  plantCount: number;
  insectCount: number;
};

export type ParkSpeciesRow = {
  latinName: string;
  commonName: string;
  category: string;
  iconicTaxonName: string | null;
  observationsCount: number;
  imageUrl: string | null;
  inaturalistId: number | null;
  isInExplore: boolean;
};

export type ExploreParkSummary = {
  parkCount: number;
  speciesSightings: number;
  nearbyCount: number | null;
};
