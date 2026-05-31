/** Filter for identification history lists */
export type TaxonGroup = 'all' | 'plant' | 'animal' | 'fungus' | 'other';

/** Binary grouping for profile gallery sections. */
export type GalleryNativeCategory = 'native' | 'non-native';

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
  galleryItem?: DetectionGalleryItem;
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
  /** Postgres `species_category` (canonical subcategory when set). */
  category: string;
  /** Canonical subcategory id for badge scoring (may match category). */
  subcategory: string | null;
  /** Main discipline id: botanist, ornithologist, … */
  mainCategory: string | null;
  /** Wikipedia summary (or other note) stored at save time; may be null for older rows. */
  description: string | null;
  /** iNaturalist-derived status at save time. */
  nativeStatus: SpeciesStatus;
  /** Native vs non-native section in the gallery. */
  nativeCategory: GalleryNativeCategory;
  /** Member who saved this identification (community explore). */
  ownerUserId?: string;
  ownerUsername?: string;
  /** Optimistic tile while Storage + DB save is in flight. */
  uploadStatus?: 'pending';
};

export type SpeciesClassification = {
  latinName: string;
  commonName: string;
  taxonGroup: string;
};

/** Taxon labels returned by the Gemini vision identification API (`api/gemini.ts`). */
export type VisionTaxonGroup = 'plants' | 'animals' | 'fungi' | 'birds';

export type ClassificationResult = {
  latinName: string;
  commonName: string;
  confidence: number;
  taxonGroup: VisionTaxonGroup;
  /** Fine-grained category id (see `constants/species-subcategories.ts`). */
  subcategory?: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
};

export type { UserFacingErr, UserFacingOk, UserFacingResult } from './user-facing-result';
export { userFacingErr, userFacingFromUnknown, userFacingOk } from './user-facing-result';
