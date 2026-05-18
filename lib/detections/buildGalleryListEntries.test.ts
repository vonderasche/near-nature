import { describe, expect, it } from 'vitest';

import { buildGalleryListEntries } from '@/lib/detections/buildGalleryListEntries';
import type { DetectionGalleryItem } from '@/types';

function item(id: string, category: 'native' | 'non-native'): DetectionGalleryItem {
  return {
    id,
    imageUrl: 'https://example.com/a.jpg',
    displayUrl: 'https://example.com/a.jpg',
    detectedAt: '2024-01-01',
    commonName: 'Test',
    latinName: 'Test sp',
    category: 'other',
    subcategory: null,
    mainCategory: null,
    description: null,
    nativeStatus: category === 'native' ? 'native' : 'unknown',
    nativeCategory: category,
  };
}

describe('buildGalleryListEntries', () => {
  it('chunks items into rows with section headers', () => {
    const entries = buildGalleryListEntries(
      [item('1', 'native'), item('2', 'native'), item('3', 'non-native')],
      2,
    );
    expect(entries.map((e) => e.kind)).toEqual(['section', 'row', 'section', 'row']);
    const firstRow = entries[1];
    expect(firstRow.kind).toBe('row');
    if (firstRow.kind === 'row') expect(firstRow.items).toHaveLength(2);
  });
});
