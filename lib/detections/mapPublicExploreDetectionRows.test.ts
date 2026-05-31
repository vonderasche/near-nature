import { describe, expect, it } from 'vitest';

import { mapPublicExploreDetectionRows } from '@/lib/detections/mapPublicExploreDetectionRows';
import type { PublicExploreDetectionRow } from '@/lib/detections/mapPublicExploreDetectionRows';

const sampleRow: PublicExploreDetectionRow = {
  id: 'd1',
  user_id: 'u1',
  username: 'birder',
  image_url: 'https://example.com/a.jpg',
  detected_at: '2024-01-01T00:00:00Z',
  common_name: 'Northern Cardinal',
  latin_name: 'Cardinalis cardinalis',
  category: 'bird',
  subcategory: 'songbirds',
  main_category: 'ornithologist',
  description: 'Bright red male at feeder',
  native_status: 'native',
};

describe('mapPublicExploreDetectionRows', () => {
  it('adds owner attribution fields', () => {
    const items = mapPublicExploreDetectionRows(
      [sampleRow],
      new Map([['https://example.com/a.jpg', 'https://signed.example/a.jpg']]),
    );
    expect(items[0]?.ownerUserId).toBe('u1');
    expect(items[0]?.ownerUsername).toBe('birder');
    expect(items[0]?.displayUrl).toBe('https://signed.example/a.jpg');
  });
});

describe('isPublicExploreRpcMissing', () => {
  it('detects missing search_public_detections RPC', async () => {
    const { isPublicExploreRpcMissing } = await import('@/lib/detections/isPublicExploreRpcMissing');
    expect(
      isPublicExploreRpcMissing({
        message: 'Could not find the function public.search_public_detections in the schema cache',
      }),
    ).toBe(true);
  });
});
