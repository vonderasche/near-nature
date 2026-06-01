import { getSpeciesSubcategoryLabel } from '@/constants/species-subcategories';
import { classificationToSpeciesCategory } from '@/lib/detections/mapSpeciesCategory';
import type { ClassificationResult, Species } from '@/types';

/** Lightweight row before iNat / Wikipedia (genus label from TFLite). */
export function speciesFromUnenrichedClassification(
  classification: ClassificationResult,
  index: number,
  speciesIdBase: number,
): Species {
  const category = classificationToSpeciesCategory(classification);
  return {
    id: `${speciesIdBase}-${index}`,
    latinName: classification.latinName,
    commonName: classification.commonName,
    taxonGroup: getSpeciesSubcategoryLabel(category),
    status: 'unknown',
  };
}
