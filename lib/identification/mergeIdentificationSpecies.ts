import { speciesFromUnenrichedClassification } from '@/lib/identification/speciesFromClassification';
import type { ClassificationResult, Species } from '@/types';

/** Build a full species list aligned with classifications (enriched rows + genus placeholders). */
export function mergeIdentificationSpecies(
  classifications: readonly ClassificationResult[],
  enriched: readonly Species[],
  speciesByIndex: Readonly<Record<number, Species>>,
  speciesIdBase: number,
): Species[] {
  return classifications.map((classification, index) => {
    return (
      speciesByIndex[index] ??
      enriched[index] ??
      speciesFromUnenrichedClassification(classification, index, speciesIdBase)
    );
  });
}
