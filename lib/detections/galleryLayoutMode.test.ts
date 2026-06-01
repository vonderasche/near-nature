import { describe, expect, it } from 'vitest';

import { parseGalleryLayoutMode } from '@/lib/detections/galleryLayoutMode';

describe('parseGalleryLayoutMode', () => {
  it('defaults to grid', () => {
    expect(parseGalleryLayoutMode(null)).toBe('grid');
    expect(parseGalleryLayoutMode('')).toBe('grid');
  });

  it('parses list', () => {
    expect(parseGalleryLayoutMode('list')).toBe('list');
  });
});
