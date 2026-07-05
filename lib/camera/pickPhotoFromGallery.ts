import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { MAX_GALLERY_PICK_COUNT } from '@/constants/gallery-pick';
import { galleryPickerOptions } from '@/lib/camera/galleryPickerOptions';
import { cropImageToSquareCenter } from '@/lib/image/cropImageToSquareCenter';

export type PickPhotosFromGalleryResult =
  | { ok: true; uris: string[] }
  | { ok: false; reason: 'cancelled' }
  | { ok: false; reason: 'permission'; message: string }
  | { ok: false; reason: 'error'; message: string };

async function prepareGalleryAssetUri(
  uri: string,
  width: number,
  height: number,
): Promise<string> {
  if (width > 0 && height > 0) {
    const cropped = await cropImageToSquareCenter(uri, width, height, 0.9);
    return cropped.uri;
  }
  return uri;
}

/**
 * Opens the photo library for up to {@link MAX_GALLERY_PICK_COUNT} images,
 * center-cropping each to a square (same framing as the camera capture path).
 */
export async function pickPhotosFromGallery(
  maxCount: number = MAX_GALLERY_PICK_COUNT,
): Promise<PickPhotosFromGalleryResult> {
  const selectionLimit = Math.min(Math.max(1, maxCount), MAX_GALLERY_PICK_COUNT);

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return {
      ok: false,
      reason: 'permission',
      message: 'Photo library access is needed to choose existing photos.',
    };
  }

  let result: ImagePicker.ImagePickerResult;
  try {
    result = await ImagePicker.launchImageLibraryAsync(
      galleryPickerOptions({ selectionLimit }),
    );
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

    result = await ImagePicker.launchImageLibraryAsync(
      galleryPickerOptions({ legacy: true, selectionLimit }),
    );
  }

  if (result.canceled || result.assets.length === 0) {
    return { ok: false, reason: 'cancelled' };
  }

  const assets = result.assets.slice(0, selectionLimit);

  try {
    const uris: string[] = [];
    for (const asset of assets) {
      const uri = await prepareGalleryAssetUri(
        asset.uri,
        asset.width ?? 0,
        asset.height ?? 0,
      );
      uris.push(uri);
    }
    return { ok: true, uris };
  } catch (e: unknown) {
    return {
      ok: false,
      reason: 'error',
      message: e instanceof Error ? e.message : 'Could not prepare the selected photos.',
    };
  }
}

/** Single-photo gallery pick (compat wrapper). */
export async function pickPhotoFromGallery(): Promise<
  | { ok: true; uri: string }
  | { ok: false; reason: 'cancelled' }
  | { ok: false; reason: 'permission'; message: string }
  | { ok: false; reason: 'error'; message: string }
> {
  const result = await pickPhotosFromGallery(1);
  if (!result.ok) return result;
  const uri = result.uris[0];
  if (!uri) {
    return { ok: false, reason: 'cancelled' };
  }
  return { ok: true, uri };
}
