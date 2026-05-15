/** Filter for identification history lists */
export type TaxonGroup = 'all' | 'plant' | 'animal' | 'fungus' | 'other';

export type NativeStatus = 'native' | 'non-native' | 'unknown';

/** Native / introduced signal (includes invasive from iNaturalist-style lookups). */
export type SpeciesStatus = NativeStatus | 'invasive';

export type Species = {
  id: string;
  latinName: string;
  commonName: string;
  taxonGroup: string;
  status: SpeciesStatus;
};

export type Identification = {
  id: string;
  userId: string;
  timestamp: string;
  species: Species;
};

/** Saved detection row for profile gallery (`detections.image_url`). */
export type DetectionGalleryItem = {
  id: string;
  /** Value persisted in `detections.image_url` (often a non-fetchable public URL when the bucket is private). */
  imageUrl: string;
  /** Signed or otherwise usable URL for `<Image />`. */
  displayUrl: string;
  detectedAt: string;
  commonName: string;
  latinName: string;
  /** Wikipedia summary (or other note) stored at save time; may be null for older rows. */
  description: string | null;
};

export type SpeciesClassification = {
  latinName: string;
  commonName: string;
  taxonGroup: string;
};

/** Taxon labels returned by the Claude vision identification API (`api/claude.ts`). */
export type VisionTaxonGroup = 'plants' | 'animals' | 'fungi' | 'birds';

export type ClassificationResult = {
  latinName: string;
  commonName: string;
  confidence: number;
  taxonGroup: VisionTaxonGroup;
  boundingBox?: { x: number; y: number; width: number; height: number };
};

export type { UserFacingErr, UserFacingOk, UserFacingResult } from './user-facing-result';
export { userFacingErr, userFacingFromUnknown, userFacingOk } from './user-facing-result';
