import { describe, expect, it } from 'vitest';

import { filterDetectionGalleryItems } from '@/lib/detections/filterDetectionGalleryItems';
import type { DetectionGalleryItem } from '@/types';

function item(overrides: Partial<DetectionGalleryItem>): DetectionGalleryItem {
  return {
    id: '1',
    imageUrl: 'https://example.com/a.jpg',
    displayUrl: 'https://example.com/a.jpg',
    detectedAt: '2024-01-01',
    commonName: 'Lion',
    latinName: 'Panthera leo',
    category: 'carnivores',
    description: 'Large African cat',
    nativeStatus: 'native',
    nativeCategory: 'native',
    ...overrides,
  };
}

describe('filterDetectionGalleryItems', () => {
  const items = [
    item({ id: 'a', commonName: 'Lion', latinName: 'Panthera leo' }),
    item({
      id: 'b',
      commonName: 'Oak',
      latinName: 'Quercus',
      category: 'trees_shrubs',
      description: 'A deciduous tree',
    }),
  ];

  it('returns all when query is empty', () => {
    expect(filterDetectionGalleryItems(items, '')).toHaveLength(2);
  });

  it('matches names and description', () => {
    expect(filterDetectionGalleryItems(items, 'panthera').map((i) => i.id)).toEqual(['a']);
    expect(filterDetectionGalleryItems(items, 'deciduous').map((i) => i.id)).toEqual(['b']);
  });

  it('filters by subcategory', () => {
    expect(
      filterDetectionGalleryItems(items, '', { kind: 'subcategory', subcategory: 'trees_shrubs' }).map(
        (i) => i.id,
      ),
    ).toEqual(['b']);
  });
});
