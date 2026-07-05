import type { ImagePickerOptions } from 'expo-image-picker';
import { Platform } from 'react-native';

import { MAX_GALLERY_PICK_COUNT } from '@/constants/gallery-pick';

type GalleryPickerOptionsParams = {
  legacy?: boolean;
  /** When set, enables multi-select up to this many images. */
  selectionLimit?: number;
};

/** Options for {@link launchImageLibraryAsync}, with Android emulator-safe legacy picker. */
export function galleryPickerOptions(params?: GalleryPickerOptionsParams): ImagePickerOptions {
  const selectionLimit = params?.selectionLimit ?? 1;
  const multiSelect = selectionLimit > 1;
  const useLegacy =
    params?.legacy ?? (Platform.OS === 'android' && !multiSelect);

  return {
    mediaTypes: ['images'],
    quality: 1,
    exif: false,
    ...(useLegacy ? { legacy: true } : {}),
    ...(multiSelect
      ? {
          allowsMultipleSelection: true,
          selectionLimit: Math.min(selectionLimit, MAX_GALLERY_PICK_COUNT),
        }
      : {}),
  };
}
