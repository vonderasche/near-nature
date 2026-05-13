import { decode } from 'base64-arraybuffer';
import { EncodingType, readAsStringAsync } from 'expo-file-system/legacy';
import { supabase } from '../lib/supabase';

// Upload a photo to Supabase Storage, returns the public URL
export async function uploadDetectionImage(
  userId: string,
  photoUri: string
): Promise<string> {
  // Read the file as base64
  const base64 = await readAsStringAsync(photoUri, {
    encoding: EncodingType.Base64,
  });

  const filename  = `${Date.now()}.jpg`;
  const filepath  = `${userId}/${filename}`;

  const { error } = await supabase.storage
    .from('detections')
    .upload(filepath, decode(base64), {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) throw error;

  // Return the path — we store this in the DB, not a public URL
  return filepath;
}

// Get a temporary signed URL to display an image (expires in 1 hour)
export async function getDetectionImageUrl(filepath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('detections')
    .createSignedUrl(filepath, 60 * 60); // 1 hour expiry

  if (error) throw error;
  return data.signedUrl;
}

// Delete an image from storage
export async function deleteDetectionImage(filepath: string): Promise<void> {
  const { error } = await supabase.storage
    .from('detections')
    .remove([filepath]);

  if (error) throw error;
}