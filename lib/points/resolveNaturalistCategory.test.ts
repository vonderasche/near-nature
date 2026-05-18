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
    expect(resolveNaturalistCategoryFromDb('insect')).toEqual({
      subcategory: 'other_insects',
      mainCategory: 'entomologist',
    });
  });

  it('resolves classification subcategory to main discipline', () => {
    expect(
      resolveNaturalistCategoryFromClassification(
        classification({ taxonGroup: 'animals', subcategory: 'beetles' }),
      ),
    ).toEqual({ subcategory: 'beetles', mainCategory: 'entomologist' });
  });

  it('falls back by taxon group when subcategory missing', () => {
    expect(resolveNaturalistCategoryFromClassification(classification({ taxonGroup: 'fungi' }))).toEqual(
      { subcategory: 'other_fungi', mainCategory: 'mycologist' },
    );
  });
});
