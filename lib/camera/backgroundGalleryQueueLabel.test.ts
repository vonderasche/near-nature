import { describe, expect, it } from 'vitest';

import { backgroundGalleryQueueLabel } from '@/lib/camera/backgroundGalleryQueueLabel';

describe('backgroundGalleryQueueLabel', () => {
  it('returns null when idle', () => {
    expect(
      backgroundGalleryQueueLabel({
        active: false,
        total: 0,
        completed: 0,
        failed: 0,
        saved: 0,
      }),
    ).toBeNull();
  });

  it('shows progress while active', () => {
    expect(
      backgroundGalleryQueueLabel({
        active: true,
        total: 5,
        completed: 2,
        failed: 0,
        saved: 2,
      }),
    ).toBe('Identifying photo 3 of 5…');
  });
});
