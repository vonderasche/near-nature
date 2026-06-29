import { supabase } from '@/lib/supabase';
import { readLocalFileAsBase64 } from '@/lib/fs/legacyFileSystem';
import { resizeImageForUpload } from '@/lib/image/resizeImageForUpload';
import { devLog } from '@/lib/devLog';

export const ML_TELEMETRY_BUCKET = 'ml-telemetry';

function decodeBase64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Upload a small JPEG for capture telemetry review. Returns storage object path or null. */
export async function uploadMlTelemetryThumbnail(
  localImageUri: string,
  sessionId: string,
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const objectPath = `${user.id}/${sessionId}.jpg`;

  try {
    const resized = await resizeImageForUpload(localImageUri, {
      maxEdge: 480,
      maxBytes: 220_000,
      compress: 0.72,
    });
    const base64 = await readLocalFileAsBase64(resized.uri);
    const bytes = decodeBase64ToBytes(base64);

    await supabase.storage.from(ML_TELEMETRY_BUCKET).remove([objectPath]).catch(() => {});

    const { error } = await supabase.storage.from(ML_TELEMETRY_BUCKET).upload(objectPath, bytes, {
      contentType: 'image/jpeg',
      upsert: false,
    });

    if (error) {
      devLog('[ml_telemetry] thumbnail upload failed', error.message);
      return null;
    }

    return objectPath;
  } catch (error) {
    devLog('[ml_telemetry] thumbnail upload failed', error);
    return null;
  }
}
