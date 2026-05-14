import { decode } from 'base64-arraybuffer';
import * as ImageManipulator from 'expo-image-manipulator';

import { DETECTIONS_BUCKET } from '@/lib/detections/detectionsBucket';
import { devLog } from '@/lib/devLog';
import { readLocalFileAsBase64 } from '@/lib/fs/legacyFileSystem';
import { supabase } from '@/lib/supabase';

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

  await supabase.storage.from(DETECTIONS_BUCKET).remove([objectPath]).catch(() => {});

  const { error: uploadError } = await supabase.storage.from(DETECTIONS_BUCKET).upload(objectPath, bytes, {
    contentType: 'image/jpeg',
    upsert: false,
  });

  if (uploadError) {
    devLog('[uploadProfileAvatarFromLibrary] upload failed', uploadError.message);
    throw new Error(
      uploadError.message.includes('Bucket not found')
        ? 'Storage bucket "detections" is missing. Run sql/storage_bucket_detections.sql in Supabase.'
        : uploadError.message,
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(DETECTIONS_BUCKET).getPublicUrl(objectPath);

  return publicUrl;
}
