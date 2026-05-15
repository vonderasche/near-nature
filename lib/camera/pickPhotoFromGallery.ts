import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { galleryPickerOptions } from '@/lib/camera/galleryPickerOptions';
import { cropImageToSquareCenter } from '@/lib/image/cropImageToSquareCenter';

export type PickPhotoFromGalleryResult =
  | { ok: true; uri: string }
  | { ok: false; reason: 'cancelled' }
  | { ok: false; reason: 'permission'; message: string }
  | { ok: false; reason: 'error'; message: string };

/**
 * Opens the photo library, then center-crops to a square (same framing as the camera capture path).
 */
export async function pickPhotoFromGallery(): Promise<PickPhotoFromGalleryResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return {
      ok: false,
      reason: 'permission',
      message: 'Photo library access is needed to choose an existing photo.',
    };
  }

  let result: ImagePicker.ImagePickerResult;
  try {
    result = await ImagePicker.launchImageLibraryAsync(galleryPickerOptions());
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    const needsLegacy =
      Platform.OS === 'android' && /ActivityNotFoundException|PICK_IMAGES/i.test(message);

    if (!needsLegacy) {
      return {
        ok: false,
        reason: 'error',
        message: 'Could not open your photo library. Try again or use the camera.',
      };
    }

    result = await ImagePicker.launchImageLibraryAsync(galleryPickerOptions(true));
  }

  if (result.canceled || !result.assets[0]?.uri) {
    return { ok: false, reason: 'cancelled' };
  }

  const asset = result.assets[0];
  const { uri, width = 0, height = 0 } = asset;

  try {
    if (width > 0 && height > 0) {
      const cropped = await cropImageToSquareCenter(uri, width, height, 0.9);
      return { ok: true, uri: cropped.uri };
    }
    return { ok: true, uri };
  } catch (e: unknown) {
    return {
      ok: false,
      reason: 'error',
      message: e instanceof Error ? e.message : 'Could not prepare the selected photo.',
    };
  }
}
