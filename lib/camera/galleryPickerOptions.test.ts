import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

import { galleryPickerOptions } from './galleryPickerOptions';

describe('galleryPickerOptions', () => {
  it('enables legacy picker on Android for single select', () => {
    expect(galleryPickerOptions()).toMatchObject({ legacy: true, mediaTypes: ['images'] });
  });

  it('disables legacy picker when multi-select is enabled', () => {
    expect(galleryPickerOptions({ selectionLimit: 5 })).toMatchObject({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });
    expect(galleryPickerOptions({ selectionLimit: 5 })).not.toHaveProperty('legacy');
  });

  it('can force legacy off', () => {
    expect(galleryPickerOptions({ legacy: false })).toMatchObject({ mediaTypes: ['images'] });
    expect(galleryPickerOptions({ legacy: false })).not.toHaveProperty('legacy');
  });
});
