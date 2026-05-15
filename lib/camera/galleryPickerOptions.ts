import type { ImagePickerOptions } from 'expo-image-picker';
import { Platform } from 'react-native';

/** Options for {@link launchImageLibraryAsync}, with Android emulator-safe legacy picker. */
export function galleryPickerOptions(legacy?: boolean): ImagePickerOptions {
  const useLegacy = legacy ?? Platform.OS === 'android';
  return {
    mediaTypes: ['images'],
    quality: 1,
    exif: false,
    ...(useLegacy ? { legacy: true } : {}),
  };
}
