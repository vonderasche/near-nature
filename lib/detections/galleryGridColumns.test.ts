import { describe, expect, it } from 'vitest';

import {
  DEFAULT_GALLERY_GRID_COLUMNS,
  parseGalleryGridColumns,
} from '@/lib/detections/galleryGridColumns';

describe('parseGalleryGridColumns', () => {
  it('accepts 1, 2, 4, and 8', () => {
    expect(parseGalleryGridColumns('1')).toBe(1);
    expect(parseGalleryGridColumns('8')).toBe(8);
  });

  it('falls back to default for invalid values', () => {
    expect(parseGalleryGridColumns('3')).toBe(DEFAULT_GALLERY_GRID_COLUMNS);
    expect(parseGalleryGridColumns(null)).toBe(DEFAULT_GALLERY_GRID_COLUMNS);
  });
});
