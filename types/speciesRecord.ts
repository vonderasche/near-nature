export type SpeciesRecordSourceUrls = {
  inat?: string;
  wikipedia?: string;
  thumbnail?: string;
  defaultPhotoUrl?: string;
};

export type SpeciesRecordTaxonomy = {
  family?: string;
  genus?: string;
  phylum?: string;
  class?: string;
  order?: string;
};

/** On-device genus profile used for identification enrichment (SQLite `species_records`). */
export type SpeciesRecord = {
  id: string;
  /** Genus name (lookup key for vision Latin names). */
  scientificName: string;
  commonName: string;
  group: string;
  floridaStatus: string;
  taxonomy: SpeciesRecordTaxonomy;
  description: string;
  identificationTraits: string[];
  interestingFacts: string[];
  sourceUrls: SpeciesRecordSourceUrls;
  updatedAt: string;
  specialistId?: string;
  inatTaxonId?: number | null;
};

/** Entry shape in `near_nature_app_bundle/genus_info/genus_profiles.enriched.min.json`. */
export type GenusProfileJsonEntry = {
  genus?: string;
  commonName?: string;
  dominium?: string;
  regnum?: string;
  phylum?: string;
  classis?: string;
  ordo?: string;
  familia?: string;
  description?: string;
  funFact?: string;
  nativeRegion?: string;
  previewGroup?: string;
  specialistId?: string;
  imageCount?: number;
  speciesCount?: number;
  inatTaxonId?: number | null;
  inatObservationsCount?: number | null;
  sourceUrls?: SpeciesRecordSourceUrls;
  updatedAt?: string;
  defaultPhoto?: { url?: string; attribution?: string; license_code?: string };
  wikipediaThumbnail?: string;
};

export type GenusProfilesJson = Record<string, GenusProfileJsonEntry>;

/** @deprecated Sample species-level catalog; use {@link GenusProfilesJson}. */
export type SpeciesCatalogJsonEntry = {
  speciesLabel?: number;
  scientificName?: string;
  commonName?: string;
  group?: string;
  floridaStatus?: string;
  taxonomy?: { family?: string; genus?: string };
  description?: string;
  identificationTraits?: string[];
  interestingFacts?: string[];
  sourceUrls?: SpeciesRecordSourceUrls;
  updatedAt?: string;
};

/** @deprecated Use {@link GenusProfilesJson}. */
export type SpeciesCatalogJson = Record<string, SpeciesCatalogJsonEntry>;
