import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearSignedDetectionUrlCache } from '@/lib/detections/signedDetectionUrlCache';

vi.mock('@/lib/detections/detectionsStorage', () => ({
  createDetectionsSignedUrl: vi.fn(),
}));

import { createDetectionsSignedUrl } from '@/lib/detections/detectionsStorage';
import { getDetectionImageDisplayUrlMap } from '@/services/detectionImageUrl';

const STORED_A =
  'https://example.supabase.co/storage/v1/object/public/detections/user-a/photo.jpg';
const STORED_B =
  'https://example.supabase.co/storage/v1/object/public/detections/user-b/photo.jpg';

afterEach(() => {
  clearSignedDetectionUrlCache();
  vi.mocked(createDetectionsSignedUrl).mockReset();
});

describe('getDetectionImageDisplayUrlMap', () => {
  it('resolves unique URLs in parallel and dedupes duplicate inputs', async () => {
    vi.mocked(createDetectionsSignedUrl).mockImplementation(async (path: string) => ({
      ok: true,
      signedUrl: `https://signed.example/${path}`,
    }));

    const map = await getDetectionImageDisplayUrlMap([STORED_A, STORED_B, STORED_A]);

    expect(map.get(STORED_A)).toBe('https://signed.example/user-a/photo.jpg');
    expect(map.get(STORED_B)).toBe('https://signed.example/user-b/photo.jpg');
    expect(createDetectionsSignedUrl).toHaveBeenCalledTimes(2);
  });
});
