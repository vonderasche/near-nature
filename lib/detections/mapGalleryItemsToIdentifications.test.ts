import { describe, expect, it } from 'vitest';

import { mapGalleryItemsToIdentifications } from '@/lib/detections/mapGalleryItemsToIdentifications';
import type { DetectionGalleryItem } from '@/types';

const sampleItem: DetectionGalleryItem = {
  id: 'det-1',
  imageUrl: 'https://example.com/a.jpg',
  displayUrl: 'https://signed.example.com/a.jpg',
  detectedAt: '2026-01-01T12:00:00.000Z',
  commonName: 'Oak',
  latinName: 'Quercus',
  category: 'tree',
  subcategory: 'trees',
  mainCategory: 'botanist',
  description: 'A tree.',
  nativeStatus: 'native',
  nativeCategory: 'native',
};

describe('mapGalleryItemsToIdentifications', () => {
  it('maps gallery items to identification history rows', () => {
    const rows = mapGalleryItemsToIdentifications('user-1', [sampleItem]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: 'det-1',
      userId: 'user-1',
      timestamp: sampleItem.detectedAt,
      species: {
        latinName: 'Quercus',
        commonName: 'Oak',
        status: 'native',
      },
      galleryItem: sampleItem,
    });
  });
});
