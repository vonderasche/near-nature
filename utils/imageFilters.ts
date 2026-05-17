// ─────────────────────────────────────────────────────────────
// src/utils/imageFilters.ts
//
// Post-processing filters applied to vision model results before
// they're shown to the user or saved to the database.
//
// Call filterAndClean() as a single step after the API returns.
// ─────────────────────────────────────────────────────────────

import { ClassificationResult, Species } from '@/types';

// ── Config ────────────────────────────────────────────────────

// Results below this confidence are hidden from the user.
// 0.65 = "reasonably confident". Lower this if you find too
// many real species are being dropped. Raise it if users are
// seeing wrong identifications.
const CONFIDENCE_THRESHOLD = 0.65;

// ── Types ─────────────────────────────────────────────────────

export interface FilterSummary {
  total:       number;   // results before filtering
  kept:        number;   // results after filtering
  dropped:     number;   // removed by confidence or dedup
}

// ── Main export ───────────────────────────────────────────────

/**
 * Run all filters on raw ClassificationResults from the vision API.
 * Call this before passing results to the iNaturalist lookup.
 *
 * Filters applied (in order):
 *   1. Remove results below confidence threshold
 *   2. Deduplicate by Latin name (keep highest confidence)
 *
 * @example
 * const raw = await identifySpeciesInImage(base64);
 * const { results, summary } = filterClassifications(raw);
 * if (results.length === 0) { showNoResultsMessage(); return; }
 */
export function filterClassifications(
  raw: ClassificationResult[],
  confidenceThreshold = CONFIDENCE_THRESHOLD,
): { results: ClassificationResult[]; summary: FilterSummary } {

  const afterConfidence = filterByConfidence(raw, confidenceThreshold);
  const afterDedup      = deduplicateByLatinName(afterConfidence);

  return {
    results: afterDedup,
    summary: {
      total:   raw.length,
      kept:    afterDedup.length,
      dropped: raw.length - afterDedup.length,
    },
  };
}

/**
 * Same as filterClassifications but works on Species[] after
 * the iNaturalist lookup has already run.
 * Useful if you want to filter at the display layer.
 */
export function filterSpecies(
  species: Species[],
  confidenceThreshold = CONFIDENCE_THRESHOLD,
): Species[] {
  return deduplicateSpecies(
    species.filter((s) => ((s as Species & { confidence?: number }).confidence ?? 1) >= confidenceThreshold),
  );
}

// ── Individual filters ────────────────────────────────────────

/**
 * Remove results where confidence is below the threshold.
 * Low-confidence results are more likely to be wrong identifications.
 */
export function filterByConfidence(
  results: ClassificationResult[],
  threshold = CONFIDENCE_THRESHOLD,
): ClassificationResult[] {
  return results.filter((r) => r.confidence >= threshold);
}

/**
 * If the same species appears more than once (can happen when
 * multiple individuals are visible), keep only the highest-
 * confidence result for that species.
 */
export function deduplicateByLatinName(
  results: ClassificationResult[],
): ClassificationResult[] {
  const seen = new Map<string, ClassificationResult>();

  for (const result of results) {
    const key      = result.latinName.toLowerCase().trim();
    const existing = seen.get(key);

    // Keep whichever has higher confidence
    if (!existing || result.confidence > existing.confidence) {
      seen.set(key, result);
    }
  }

  return Array.from(seen.values());
}

/**
 * Deduplicate Species[] by Latin name after iNaturalist lookup.
 */
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

// ── Validation helpers ────────────────────────────────────────

/**
 * Check if the vision API returned an error object instead of results.
 * Handles the case where the prompt's moderation check fires.
 *
 * @example
 * if (hasInappropriateContent(raw)) {
 *   showError('This image cannot be identified.');
 *   return;
 * }
 */
export function hasInappropriateContent(
  raw: ClassificationResult[] | Array<{ error?: string }>,
): boolean {
  return raw.some(
    (item) => 'error' in item && item.error === 'inappropriate_content',
  );
}

/**
 * True if results came back empty after filtering.
 * Lets you show a "no species found" message vs a generic error.
 */
export function hasNoSpeciesFound(results: ClassificationResult[]): boolean {
  return results.length === 0;
}