import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

import { galleryPickerOptions } from './galleryPickerOptions';

describe('galleryPickerOptions', () => {
  it('enables legacy picker on Android by default', () => {
    expect(galleryPickerOptions()).toMatchObject({ legacy: true, mediaTypes: ['images'] });
  });

  it('can force legacy off', () => {
    expect(galleryPickerOptions(false)).toMatchObject({ mediaTypes: ['images'] });
    expect(galleryPickerOptions(false)).not.toHaveProperty('legacy');
  });
});
