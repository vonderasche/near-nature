import { describe, expect, it } from 'vitest';

import { mapUserDetectionRowToGalleryRow, type UserDetectionRow } from '@/lib/db/detectionRecordRow';

describe('detectionRecordRow', () => {
  it('maps stored rows to gallery rows', () => {
    const stored: UserDetectionRow = {
      id: 'd1',
      user_id: 'u1',
      image_url: 'https://example.com/a.jpg',
      detected_at: '2024-01-01T00:00:00Z',
      common_name: 'Oak',
      latin_name: 'Quercus',
      category: 'trees',
      subcategory: 'trees',
      main_category: 'botanist',
      description: null,
      native_status: 'native',
      confidence: 92.5,
      state: 'FL',
      inaturalist_id: '123',
      is_sensitive: 0,
      points: 10,
      synced_at: 1,
      created_at: 1,
    };

    expect(mapUserDetectionRowToGalleryRow(stored)).toEqual({
      id: 'd1',
      image_url: 'https://example.com/a.jpg',
      detected_at: '2024-01-01T00:00:00Z',
      common_name: 'Oak',
      latin_name: 'Quercus',
      category: 'trees',
      subcategory: 'trees',
      main_category: 'botanist',
      description: null,
      native_status: 'native',
    });
  });
});
