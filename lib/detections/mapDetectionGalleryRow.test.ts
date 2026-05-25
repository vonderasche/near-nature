import { describe, expect, it } from 'vitest';

import { mapDetectionGalleryRows } from '@/lib/detections/mapDetectionGalleryRow';

describe('mapDetectionGalleryRows', () => {
  it('maps rows using the display URL map with stored URL fallback', () => {
    const stored = 'https://x.co/storage/v1/object/public/detections/u/photo.jpg';
    const items = mapDetectionGalleryRows(
      [
        {
          id: 'id-1',
          image_url: stored,
          detected_at: '2026-01-01T00:00:00Z',
          common_name: 'Oak',
          latin_name: 'Quercus',
          category: 'trees_shrubs',
          description: '  A tree. ',
          native_status: 'native',
        },
      ],
      new Map([[stored, 'https://signed.example/photo.jpg']]),
    );

    expect(items[0]).toMatchObject({
      id: 'id-1',
      displayUrl: 'https://signed.example/photo.jpg',
      commonName: 'Oak',
      nativeCategory: 'native',
      description: 'A tree.',
    });
  });
});
