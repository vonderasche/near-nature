import { describe, expect, it } from 'vitest';

import { extractDetectionsObjectPathFromStoredUrl } from '@/lib/detections/extractDetectionsObjectPath';

describe('extractDetectionsObjectPathFromStoredUrl', () => {
  it('parses object path and ignores cache-bust query params', () => {
    const userId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const stored = `https://example.supabase.co/storage/v1/object/public/detections/${userId}/profile-avatar.jpg?v=1715000000000`;
    expect(extractDetectionsObjectPathFromStoredUrl(stored)).toBe(`${userId}/profile-avatar.jpg`);
  });

  it('returns null for non-detections URLs', () => {
    expect(extractDetectionsObjectPathFromStoredUrl('https://example.com/photo.jpg')).toBeNull();
  });
});
