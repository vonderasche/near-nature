import { describe, expect, it } from 'vitest';

import type { CachedGalleryList } from '@/lib/detections/galleryListCache';
import { GALLERY_LIST_CACHE_VERSION } from '@/constants/gallery-cache';

describe('galleryListCache payload', () => {
  it('stores rows without displayUrl', () => {
    const entry: CachedGalleryList = {
      v: GALLERY_LIST_CACHE_VERSION,
      userId: 'u1',
      publicOnly: false,
      hasMore: true,
      cachedAt: Date.now(),
      rows: [
        {
          id: 'd1',
          image_url: 'https://x.supabase.co/storage/v1/object/public/detections/u1/a.jpg',
          detected_at: '2024-01-01T00:00:00Z',
          common_name: 'Oak',
          latin_name: 'Quercus',
          category: 'trees_shrubs',
          subcategory: 'trees_shrubs',
          main_category: 'botanist',
          description: null,
          native_status: 'native',
        },
      ],
    };
    const parsed = JSON.parse(JSON.stringify(entry)) as CachedGalleryList;
    expect(parsed.rows[0].image_url).toContain('detections');
    expect('displayUrl' in (parsed.rows[0] as object)).toBe(false);
  });
});
