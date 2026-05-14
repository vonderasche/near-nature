import { decode } from 'base64-arraybuffer';
import { randomUUID } from 'expo-crypto';
import { readLocalFileAsBase64 } from '@/lib/fs/legacyFileSystem';

import { lookupNativeStatus } from '@/api/inaturalist';
import { DETECTIONS_BUCKET } from '@/lib/detections/detectionsBucket';
import { classificationToSpeciesCategory } from '@/lib/detections/mapSpeciesCategory';
import { speciesStatusToNativeColumn } from '@/lib/detections/mapNativeStatusDb';
import { devLog } from '@/lib/devLog';
import { supabase } from '@/lib/supabase';
import { extractDetectionsObjectPathFromStoredUrl } from './detectionImageUrl';
import type { ClassificationResult, Species, SpeciesStatus } from '@/types';

export type SaveDetectionInput = {
  localImageUri: string;
  userId: string;
  species: Species;
  classification: ClassificationResult;
  stateCode: string;
  /** Short note shown in DB — e.g. Wikipedia lead or empty */
  description?: string | null;
};

function isDuplicateSpeciesTodayError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('duplicate') ||
    m.includes('unique') ||
    m.includes('one_species_per_day') ||
    m.includes('violates unique constraint')
  );
}

/**
 * Uploads the local image to Supabase Storage (`detections/{userId}/...`) and inserts `public.detections`.
 */
export async function saveDetection(input: SaveDetectionInput): Promise<void> {
  const { localImageUri, userId, species, classification, stateCode, description = null } = input;

  const nat = await lookupNativeStatus(species.latinName, stateCode.trim());
  const inaturalistId = nat ? String(nat.taxonId) : null;

  const ext = localImageUri.toLowerCase().includes('.png') ? 'png' : 'jpg';
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const objectPath = `${userId}/${randomUUID()}.${ext}`;

  // Do not use `fetch(localUri)` for camera files — on Android it often throws "Network request failed".
  const base64 = await readLocalFileAsBase64(localImageUri);
  const bytes = decode(base64);

  const { error: uploadError } = await supabase.storage.from(DETECTIONS_BUCKET).upload(objectPath, bytes, {
    contentType,
    upsert: false,
  });

  if (uploadError) {
    devLog('[saveDetection] Image not uploaded', {
      bucket: DETECTIONS_BUCKET,
      path: objectPath,
      error: uploadError.message,
    });
    throw new Error(
      uploadError.message.includes('Bucket not found')
        ? 'Storage bucket "detections" is missing. Run sql/storage_bucket_detections.sql in Supabase.'
        : uploadError.message
    );
  }

  devLog('[saveDetection] Image uploaded', { bucket: DETECTIONS_BUCKET, path: objectPath });

  const {
    data: { publicUrl },
  } = supabase.storage.from(DETECTIONS_BUCKET).getPublicUrl(objectPath);

  const category = classificationToSpeciesCategory(classification);
  const nativeStatus = speciesStatusToNativeColumn(species.status as SpeciesStatus);
  const confidencePct = Math.min(
    100,
    Math.max(0, Math.round(Number(classification.confidence) * 10000) / 100)
  );

  const { error: insertError } = await supabase.from('detections').insert({
    user_id: userId,
    image_url: publicUrl,
    common_name: species.commonName,
    latin_name: species.latinName,
    confidence: confidencePct,
    category,
    description: description?.trim() ? description.trim().slice(0, 8000) : null,
    native_status: nativeStatus,
    state: stateCode.trim().toUpperCase().slice(0, 2),
    inaturalist_id: inaturalistId,
    is_sensitive: false,
    is_verified: false,
    confidence_threshold: 70,
    points: 0,
  });

  if (insertError) {
    await supabase.storage.from(DETECTIONS_BUCKET).remove([objectPath]).catch(() => {});
    if (isDuplicateSpeciesTodayError(insertError.message)) {
      throw new Error(
        'You already saved this species today. Try again tomorrow or save a different identification.'
      );
    }
    throw insertError;
  }
}

/**
 * Deletes the current user's detection row (RLS) and best-effort removes the image from Storage.
 */
export async function deleteSavedDetection(detectionId: string): Promise<void> {
  const { data: row, error: selectError } = await supabase
    .from('detections')
    .select('image_url')
    .eq('id', detectionId)
    .maybeSingle();

  if (selectError) throw selectError;
  if (!row) {
    throw new Error('Photo not found or you cannot delete it.');
  }

  const storagePath = row.image_url
    ? extractDetectionsObjectPathFromStoredUrl(String(row.image_url))
    : null;

  const { error: deleteError } = await supabase.from('detections').delete().eq('id', detectionId);
  if (deleteError) throw deleteError;

  if (storagePath) {
    await supabase.storage.from(DETECTIONS_BUCKET).remove([storagePath]).catch(() => {});
  }
}
