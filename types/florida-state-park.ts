export type ParkSpeciesHighlight = {
  name: string;
  imageUrl: string;
};

export type FloridaStatePark = {
  parkId: string;
  unitId: string;
  parkName: string;
  webAlias: string;
  county: string;
  district: number | null;
  acreage: number | null;
  address: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  gpsSource: string;
  hasGps: boolean;
  parkPageUrl: string;
  imageUrl: string;
  imageSource: string;
  imageLicense: string;
  imageAttribution: string;
  description: string;
  topPlants: ParkSpeciesHighlight[];
  topAnimals: ParkSpeciesHighlight[];
  publicAccess: string;
  dataSource: string;
  updatedAt: string;
};
