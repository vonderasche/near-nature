import { decode } from 'base64-arraybuffer';
import { randomUUID } from 'expo-crypto';
import { readLocalFileAsBase64 } from '@/lib/fs/legacyFileSystem';

import { lookupNativeStatus } from '@/api/inaturalist';
import { classificationToSpeciesCategory } from '@/lib/detections/mapSpeciesCategory';
import { speciesStatusToNativeColumn } from '@/lib/detections/mapNativeStatusDb';
import { devLog } from '@/lib/devLog';
import { supabase } from '@/lib/supabase';
import type { ClassificationResult, Species, SpeciesStatus } from '@/types';

const BUCKET = 'detections';

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

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
    contentType,
    upsert: false,
  });

  if (uploadError) {
    devLog('[saveDetection] Image not uploaded', {
      bucket: BUCKET,
      path: objectPath,
      error: uploadError.message,
    });
    throw new Error(
      uploadError.message.includes('Bucket not found')
        ? 'Storage bucket "detections" is missing. Run sql/storage_bucket_detections.sql in Supabase.'
        : uploadError.message
    );
  }

  devLog('[saveDetection] Image uploaded', { bucket: BUCKET, path: objectPath });

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);

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
    await supabase.storage.from(BUCKET).remove([objectPath]).catch(() => {});
    if (isDuplicateSpeciesTodayError(insertError.message)) {
      throw new Error(
        'You already saved this species today. Try again tomorrow or save a different identification.'
      );
    }
    throw insertError;
  }
}
