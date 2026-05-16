import { decode } from 'base64-arraybuffer';
import * as ImageManipulator from 'expo-image-manipulator';

import {
  getDetectionsObjectPublicUrl,
  removeDetectionsObjects,
  uploadDetectionsObject,
} from '@/lib/detections/detectionsStorage';
import { devLog } from '@/lib/devLog';
import { readLocalFileAsBase64 } from '@/lib/fs/legacyFileSystem';

/** Stored under the user’s folder in `detections` (same bucket as saved identifications). */
const PROFILE_AVATAR_OBJECT_NAME = 'profile-avatar.jpg';

/**
 * Resizes a picked image, uploads to `detections/{userId}/profile-avatar.jpg`, and returns the public URL stored in `users.avatar_url`.
 * Replaces any previous file at that key (remove + upload; works with insert-only storage policies).
 */
export async function uploadProfileAvatarFromLibrary(userId: string, localUri: string): Promise<string> {
  const processed = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 512 } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
  );

  const base64 = await readLocalFileAsBase64(processed.uri);
  const bytes = decode(base64);
  const objectPath = `${userId}/${PROFILE_AVATAR_OBJECT_NAME}`;

  await removeDetectionsObjects([objectPath]);

  try {
    await uploadDetectionsObject(objectPath, bytes, { contentType: 'image/jpeg', upsert: false });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    devLog('[uploadProfileAvatarFromLibrary] upload failed', msg);
    throw e instanceof Error ? e : new Error(msg);
  }

  const publicUrl = getDetectionsObjectPublicUrl(objectPath);
  // Same object path on re-upload — bust image caches in clients and React state.
  return `${publicUrl}?v=${Date.now()}`;
}
