import { describe, expect, it } from 'vitest';

import {
  speciesCategoryMatchesGroup,
  speciesCategoryMatchesSubcategory,
} from '@/lib/detections/speciesSubcategory';

describe('speciesSubcategory', () => {
  it('matches legacy categories to groups', () => {
    expect(speciesCategoryMatchesGroup('bird', 'animal')).toBe(true);
    expect(speciesCategoryMatchesGroup('plant_tree', 'plant')).toBe(true);
  });

  it('maps legacy bird to songbirds subcategory filter', () => {
    expect(speciesCategoryMatchesSubcategory('bird', 'songbirds')).toBe(true);
    expect(speciesCategoryMatchesSubcategory('plant_tree', 'trees_shrubs')).toBe(true);
  });
});
