import { describe, expect, it } from 'vitest';

import {
  resolveSpecialistForPreviewLabel,
  SPECIALIST_DISPLAY_NAMES,
} from '@/lib/camera/mobilenet/previewToSpecialist';

describe('previewToSpecialist', () => {
  it('routes bird preview to birds asset folder', () => {
    expect(resolveSpecialistForPreviewLabel('Bird')).toBe('birds');
    expect(SPECIALIST_DISPLAY_NAMES.birds).toBe('Birds');
  });

  it('routes wildflower preview to herbaceous_plants', () => {
    expect(resolveSpecialistForPreviewLabel('Wildflower')).toBe('herbaceous_plants');
  });

  it('returns null for non-organism previews', () => {
    expect(resolveSpecialistForPreviewLabel('No Plant or Animal')).toBeNull();
  });
});
