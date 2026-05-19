import { describe, expect, it } from 'vitest';

import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';
import { buildLocalScoringSnapshot } from '@/lib/profile/buildLocalScoringSnapshot';

describe('buildLocalScoringSnapshot', () => {
  it('counts unique species per main category', () => {
    const rows: DetectionGalleryRow[] = [
      {
        id: '1',
        image_url: 'file:///a.jpg',
        detected_at: '2026-01-01T00:00:00Z',
        common_name: 'A',
        latin_name: 'Species a',
        category: 'bird',
        main_category: 'ornithologist',
        subcategory: 'songbirds',
        description: null,
        native_status: null,
      },
      {
        id: '2',
        image_url: 'file:///b.jpg',
        detected_at: '2026-01-02T00:00:00Z',
        common_name: 'B',
        latin_name: 'Species b',
        category: 'bird',
        main_category: 'ornithologist',
        subcategory: 'raptors',
        description: null,
        native_status: null,
      },
    ];

    const snap = buildLocalScoringSnapshot(rows);
    const birds = snap.mains.find((m) => m.id === 'ornithologist');
    expect(birds?.speciesCount).toBe(2);
    expect(snap.breakdown.totalSpecies).toBe(2);
    expect(snap.awardKeys.size).toBe(0);
  });
});
