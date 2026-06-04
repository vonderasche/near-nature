import { describe, expect, it } from 'vitest';

import {
  previewLabelToSubcategory,
  previewLabelToTaxonGroup,
} from '@/lib/camera/mobilenet/previewLabelTaxonomy';

describe('previewLabelTaxonomy', () => {
  it('maps reptile routing to lizards subcategory', () => {
    expect(previewLabelToTaxonGroup('Reptile / Lizard')).toBe('animals');
    expect(previewLabelToSubcategory('Reptile / Lizard')).toBe('lizards');
  });

  it('maps snake and frog preview labels', () => {
    expect(previewLabelToSubcategory('Snake')).toBe('snakes');
    expect(previewLabelToSubcategory('Frog / Amphibian')).toBe('frogs_toads');
  });

  it('maps plant preview labels', () => {
    expect(previewLabelToTaxonGroup('Tree')).toBe('plants');
    expect(previewLabelToSubcategory('Tree')).toBe('trees_shrubs');
  });

  it('maps fungi preview to other_fungi for Postgres enum', () => {
    expect(previewLabelToTaxonGroup('Fungi / Mushroom')).toBe('fungi');
    expect(previewLabelToSubcategory('Fungi / Mushroom')).toBe('other_fungi');
  });
});
