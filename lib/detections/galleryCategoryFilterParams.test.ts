import { describe, expect, it } from 'vitest';

import { toGalleryListFilterParams } from '@/lib/detections/galleryCategoryFilterParams';

describe('toGalleryListFilterParams', () => {
  it('returns nulls for all', () => {
    expect(toGalleryListFilterParams({ kind: 'all' })).toEqual({
      filterGroup: null,
      filterSubcategory: null,
    });
  });

  it('maps group filter', () => {
    expect(toGalleryListFilterParams({ kind: 'group', group: 'plant' })).toEqual({
      filterGroup: 'plant',
      filterSubcategory: null,
    });
  });

  it('maps subcategory filter', () => {
    expect(
      toGalleryListFilterParams({ kind: 'subcategory', subcategory: 'songbirds' }),
    ).toEqual({
      filterGroup: null,
      filterSubcategory: 'songbirds',
    });
  });
});
