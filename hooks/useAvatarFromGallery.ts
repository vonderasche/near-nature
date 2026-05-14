import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import type { UpdateUserResult } from '@/hooks/useUser';
import type { UpdateUserPayload } from '@/services/userService';
import { uploadProfileAvatarFromLibrary } from '@/services/avatarService';
import { userFacingErr, userFacingFromUnknown, type UserFacingResult } from '@/types/user-facing-result';

type UpdateFn = (payload: UpdateUserPayload) => Promise<UpdateUserResult>;

export type PickAvatarResult = UserFacingResult | { ok: false; canceled: true };

/**
 * Opens the device photo library, uploads a square-cropped JPEG to storage, and updates `avatar_url` via `update`.
 */
export function useAvatarFromGallery(userId: string | undefined, update: UpdateFn) {
  const [busy, setBusy] = useState(false);

  const pickAndSetAvatar = useCallback(async (): Promise<PickAvatarResult> => {
    if (!userId) {
      return userFacingErr('Not signed in.');
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return userFacingErr('Allow photo library access to choose a profile picture.');
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
      return userFacingFromUnknown(e, 'Could not open photo library.');
    }

    if (result.canceled) {
      return { ok: false, canceled: true };
    }

    const uri = result.assets[0]?.uri;
    if (!uri) {
      return userFacingErr('No image selected.');
    }

    setBusy(true);
    try {
      const publicUrl = await uploadProfileAvatarFromLibrary(userId, uri);
      const r = await update({ avatar_url: publicUrl });
      return r;
    } catch (e: unknown) {
      return userFacingFromUnknown(e, 'Could not update profile photo.');
    } finally {
      setBusy(false);
    }
  }, [userId, update]);

  return { pickAndSetAvatar, busy };
}
