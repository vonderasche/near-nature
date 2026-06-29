// Post-processing filters applied to vision model results before
// they're shown to the user or saved to the database.

import { ClassificationResult, Species } from '@/types';

export const CONFIDENCE_THRESHOLD = 0.65;

export interface FilterSummary {
  total: number;
  kept: number;
  dropped: number;
}

export function filterClassifications(
  raw: ClassificationResult[],
  confidenceThreshold = CONFIDENCE_THRESHOLD,
): { results: ClassificationResult[]; summary: FilterSummary } {
  const afterConfidence = filterByConfidence(raw, confidenceThreshold);
  const afterDedup = deduplicateByLatinName(afterConfidence);

  return {
    results: afterDedup,
    summary: {
      total: raw.length,
      kept: afterDedup.length,
      dropped: raw.length - afterDedup.length,
    },
  };
}

export function filterSpecies(
  species: Species[],
  confidenceThreshold = CONFIDENCE_THRESHOLD,
): Species[] {
  return deduplicateSpecies(
    species.filter((s) => ((s as Species & { confidence?: number }).confidence ?? 1) >= confidenceThreshold),
  );
}

export function filterByConfidence(
  results: ClassificationResult[],
  threshold = CONFIDENCE_THRESHOLD,
): ClassificationResult[] {
  return results.filter((r) => r.confidence >= threshold);
}

export function deduplicateByLatinName(
  results: ClassificationResult[],
): ClassificationResult[] {
  const seen = new Map<string, ClassificationResult>();

  for (const result of results) {
    const key = result.latinName.toLowerCase().trim();
    const existing = seen.get(key);

    if (!existing || result.confidence > existing.confidence) {
      seen.set(key, result);
    }
  }

  return Array.from(seen.values());
}

export function deduplicateSpecies(species: Species[]): Species[] {
  const seen = new Map<string, Species>();

  for (const s of species) {
    const key = s.latinName.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.set(key, s);
    }
  }

  return Array.from(seen.values());
}

export function hasInappropriateContent(
  raw: ClassificationResult[] | Array<{ error?: string }>,
): boolean {
  return raw.some(
    (item) => 'error' in item && item.error === 'inappropriate_content',
  );
}

export function hasNoSpeciesFound(results: ClassificationResult[]): boolean {
  return results.length === 0;
}
