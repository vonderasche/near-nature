import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

vi.mock('@/lib/camera/galleryPickerOptions', () => ({
  galleryPickerOptions: vi.fn(() => ({
    mediaTypes: ['images'],
    quality: 1,
    exif: false,
  })),
}));

vi.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: vi.fn(),
  launchImageLibraryAsync: vi.fn(),
}));

vi.mock('@/lib/image/cropImageToSquareCenter', () => ({
  cropImageToSquareCenter: vi.fn(),
}));

import * as ImagePicker from 'expo-image-picker';

import { cropImageToSquareCenter } from '@/lib/image/cropImageToSquareCenter';

import { pickPhotoFromGallery } from './pickPhotoFromGallery';

describe('pickPhotoFromGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({
      granted: true,
      status: 'granted',
      expires: 'never',
      canAskAgain: true,
    } as Awaited<ReturnType<typeof ImagePicker.requestMediaLibraryPermissionsAsync>>);
  });

  it('returns permission error when library access denied', async () => {
    vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({
      granted: false,
      status: 'denied',
      expires: 'never',
      canAskAgain: true,
    } as Awaited<ReturnType<typeof ImagePicker.requestMediaLibraryPermissionsAsync>>);

    const result = await pickPhotoFromGallery();
    expect(result).toEqual({
      ok: false,
      reason: 'permission',
      message: 'Photo library access is needed to choose an existing photo.',
    });
  });

  it('returns cropped uri for selected asset', async () => {
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///picked.jpg', width: 4000, height: 3000 }],
    });
    vi.mocked(cropImageToSquareCenter).mockResolvedValue({
      uri: 'file:///picked-square.jpg',
      width: 3000,
      height: 3000,
    });

    const result = await pickPhotoFromGallery();
    expect(result).toEqual({ ok: true, uri: 'file:///picked-square.jpg' });
    expect(cropImageToSquareCenter).toHaveBeenCalledWith('file:///picked.jpg', 4000, 3000, 0.9);
  });
});
