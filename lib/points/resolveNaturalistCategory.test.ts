import { describe, expect, it } from 'vitest';

import {
  resolveNaturalistCategoryFromClassification,
  resolveNaturalistCategoryFromDb,
} from '@/lib/points/resolveNaturalistCategory';
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

describe('resolveNaturalistCategory', () => {
  it('maps legacy db category to canonical sub + main', () => {
    expect(resolveNaturalistCategoryFromDb('trees')).toEqual({
      subcategory: 'trees_shrubs',
      mainCategory: 'botanist',
    });
    expect(resolveNaturalistCategoryFromDb('insect')).toBeNull();
  });

  it('resolves classification subcategory to main discipline', () => {
    expect(
      resolveNaturalistCategoryFromClassification(
        classification({ taxonGroup: 'animals', subcategory: 'snakes' }),
      ),
    ).toEqual({ subcategory: 'snakes', mainCategory: 'herpetologist' });
  });

  it('maps unlisted animal subcategory to default mammal bucket', () => {
    expect(
      resolveNaturalistCategoryFromClassification(
        classification({ taxonGroup: 'animals', subcategory: 'beetles' }),
      ),
    ).toEqual({ subcategory: 'small_mammals', mainCategory: 'mammalogist' });
  });

  it('returns null for fungi (no badge discipline)', () => {
    expect(resolveNaturalistCategoryFromClassification(classification({ taxonGroup: 'fungi' }))).toBeNull();
  });
});
