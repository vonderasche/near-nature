import type { FileOptions } from '@supabase/storage-js';

import { supabase } from '@/lib/supabase';

import { DETECTIONS_BUCKET } from './detectionsBucket';

const BUCKET_SETUP_HINT =
  'Storage bucket "detections" is missing. Run sql/storage_bucket_detections.sql in Supabase.';

/** Second argument to `storage.from(...).upload()` — stays aligned with `@supabase/storage-js`. */
export type DetectionsStorageUploadBody = Parameters<
  ReturnType<(typeof supabase)['storage']['from']>['upload']
>[1];

function formatUploadErrorMessage(message: string): string {
  return message.includes('Bucket not found') ? BUCKET_SETUP_HINT : message;
}

/**
 * Upload a single object to the `detections` bucket. Throws `Error` with a user-facing message on failure.
 *
 * `fileOptions` is passed through to the client (e.g. `contentType` when the body is not a `Blob`/`File`/`FormData`).
 */
export async function uploadDetectionsObject(
  objectPath: string,
  body: DetectionsStorageUploadBody,
  fileOptions?: FileOptions,
): Promise<void> {
  const { error } = await supabase.storage.from(DETECTIONS_BUCKET).upload(objectPath, body, {
    upsert: false,
    ...fileOptions,
  });
  if (error) {
    throw new Error(formatUploadErrorMessage(error.message));
  }
}

export function getDetectionsObjectPublicUrl(objectPath: string): string {
  const {
    data: { publicUrl },
  } = supabase.storage.from(DETECTIONS_BUCKET).getPublicUrl(objectPath);
  return publicUrl;
}

/**
 * Best-effort delete (ignores network/RLS/missing-object errors). Pass an empty array for a no-op.
 */
export async function removeDetectionsObjects(objectPaths: string[]): Promise<void> {
  if (objectPaths.length === 0) return;
  await supabase.storage.from(DETECTIONS_BUCKET).remove(objectPaths).catch(() => {});
}

export type CreateDetectionsSignedUrlResult =
  | { ok: true; signedUrl: string }
  | { ok: false; message: string };

/**
 * Signed URL for private-bucket reads.
 */
export async function createDetectionsSignedUrl(
  objectPath: string,
  expiresInSeconds: number,
): Promise<CreateDetectionsSignedUrlResult> {
  const { data, error } = await supabase.storage
    .from(DETECTIONS_BUCKET)
    .createSignedUrl(objectPath, expiresInSeconds);
  if (error) return { ok: false, message: error.message };
  if (!data?.signedUrl) return { ok: false, message: 'no signedUrl' };
  return { ok: true, signedUrl: data.signedUrl };
}
