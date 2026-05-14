import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import type { UpdateUserResult } from '@/hooks/useUser';
import type { UpdateUserPayload } from '@/services/userService';
import { uploadProfileAvatarFromLibrary } from '@/services/avatarService';

type UpdateFn = (payload: UpdateUserPayload) => Promise<UpdateUserResult>;

export type PickAvatarResult =
  | { ok: true }
  | { ok: false; message: string }
  | { ok: false; canceled: true };

/**
 * Opens the device photo library, uploads a square-cropped JPEG to storage, and updates `avatar_url` via `update`.
 */
export function useAvatarFromGallery(userId: string | undefined, update: UpdateFn) {
  const [busy, setBusy] = useState(false);

  const pickAndSetAvatar = useCallback(async (): Promise<PickAvatarResult> => {
    if (!userId) {
      return { ok: false, message: 'Not signed in.' };
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return { ok: false, message: 'Allow photo library access to choose a profile picture.' };
    }

    let result: ImagePicker.ImagePickerResult;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
        // Android 13+ Photo Picker (ACTION_PICK_IMAGES) is missing on some emulators — use legacy intent.
        ...(Platform.OS === 'android' ? { legacy: true as const } : {}),
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Could not open photo library.';
      return { ok: false, message };
    }

    if (result.canceled) {
      return { ok: false, canceled: true };
    }

    const uri = result.assets[0]?.uri;
    if (!uri) {
      return { ok: false, message: 'No image selected.' };
    }

    setBusy(true);
    try {
      const publicUrl = await uploadProfileAvatarFromLibrary(userId, uri);
      const r = await update({ avatar_url: publicUrl });
      return r.ok ? { ok: true } : { ok: false, message: r.message };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Could not update profile photo.';
      return { ok: false, message };
    } finally {
      setBusy(false);
    }
  }, [userId, update]);

  return { pickAndSetAvatar, busy };
}
