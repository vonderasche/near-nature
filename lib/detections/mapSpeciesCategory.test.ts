import { describe, expect, it } from 'vitest';

import { classificationToSpeciesCategory } from '@/lib/detections/mapSpeciesCategory';
import type { ClassificationResult } from '@/types';

function classification(
  overrides: Partial<ClassificationResult> & Pick<ClassificationResult, 'taxonGroup'>,
): ClassificationResult {
  return {
    latinName: 'Test species',
    commonName: 'Test',
    confidence: 0.9,
    ...overrides,
  };
}

describe('classificationToSpeciesCategory', () => {
  it('uses explicit subcategory when valid', () => {
    expect(
      classificationToSpeciesCategory(
        classification({ taxonGroup: 'animals', subcategory: 'snakes' }),
      ),
    ).toBe('snakes');
    expect(
      classificationToSpeciesCategory(
        classification({ taxonGroup: 'plants', subcategory: 'trees' }),
      ),
    ).toBe('trees_shrubs');
  });

  it('stores fungi as other_fungi enum value (no badge discipline)', () => {
    expect(classificationToSpeciesCategory(classification({ taxonGroup: 'fungi' }))).toBe(
      'other_fungi',
    );
  });

  it('falls back by taxon group', () => {
    expect(classificationToSpeciesCategory(classification({ taxonGroup: 'birds' }))).toBe(
      'songbirds',
    );
    expect(classificationToSpeciesCategory(classification({ taxonGroup: 'plants' }))).toBe(
      'wildflowers',
    );
  });
});
