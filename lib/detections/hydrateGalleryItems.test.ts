import { describe, expect, it, vi } from 'vitest';

import {
  galleryItemsPlaceholderFromRows,
  hydrateGalleryItemsFromRows,
} from '@/lib/detections/hydrateGalleryItems';
import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';

vi.mock('@/services/detectionImageUrl', () => ({
  getDetectionImageDisplayUrlMap: vi.fn(async (urls: string[]) => {
    const map = new Map<string, string>();
    for (const u of urls) map.set(u.trim(), `https://signed.example/${u}`);
    return map;
  }),
}));

const row: DetectionGalleryRow = {
  id: '1',
  image_url: 'https://x.co/storage/detections/u/a.jpg',
  detected_at: '2024-01-01',
  common_name: 'Oak',
  latin_name: 'Quercus',
  category: 'trees_shrubs',
  description: null,
  native_status: 'native',
};

describe('hydrateGalleryItems', () => {
  it('placeholder uses stored image_url as interim displayUrl', () => {
    const items = galleryItemsPlaceholderFromRows([row]);
    expect(items[0].displayUrl).toBe(row.image_url);
    expect(items[0].imageUrl).toBe(row.image_url);
  });

  it('hydrate resolves signed urls', async () => {
    const items = await hydrateGalleryItemsFromRows([row]);
    expect(items[0].displayUrl).toContain('signed.example');
  });
});
