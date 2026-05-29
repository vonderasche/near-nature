import { describe, expect, it } from 'vitest';

import {
  resolveSpecialistForPreviewLabel,
  SPECIALIST_DISPLAY_NAMES,
} from '@/lib/camera/mobilenet/previewToSpecialist';

describe('previewToSpecialist', () => {
  it('routes bird preview to birds_species', () => {
    expect(resolveSpecialistForPreviewLabel('Bird')).toBe('birds_species');
    expect(SPECIALIST_DISPLAY_NAMES.birds_species).toBe('Birds');
  });

  it('routes wildflower preview to herbaceous_plants', () => {
    expect(resolveSpecialistForPreviewLabel('Wildflower')).toBe('herbaceous_plants');
  });

  it('returns null for herps and non-organism previews', () => {
    expect(resolveSpecialistForPreviewLabel('Snake')).toBeNull();
    expect(resolveSpecialistForPreviewLabel('No Plant or Animal')).toBeNull();
  });
});
