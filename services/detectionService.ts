import { decode } from 'base64-arraybuffer';
import { randomUUID } from 'expo-crypto';
import { readLocalFileAsBase64 } from '@/lib/fs/legacyFileSystem';

import { lookupNativeStatus } from '@/api/inaturalist';
import { DETECTIONS_BUCKET } from '@/lib/detections/detectionsBucket';
import {
  getDetectionsObjectPublicUrl,
  removeDetectionsObjects,
  uploadDetectionsObject,
} from '@/lib/detections/detectionsStorage';
import { classificationToSpeciesCategory } from '@/lib/detections/mapSpeciesCategory';
import { speciesStatusToNativeColumn } from '@/lib/detections/mapNativeStatusDb';
import { devLog } from '@/lib/devLog';
import { supabase } from '@/lib/supabase';
import { extractDetectionsObjectPathFromStoredUrl } from './detectionImageUrl';
import { FIRST_SPECIES_DISCOVERY_BONUS_POINTS } from '@/lib/discoveries/discoveryBonus';
import type { ClassificationResult, Species, SpeciesStatus } from '@/types';
import type { NewSpeciesDiscovery } from '@/types/species-discovery';

export type SaveDetectionResult = {
  detectionId: string;
  newSpeciesDiscovery: NewSpeciesDiscovery | null;
};

export type SaveDetectionInput = {
  localImageUri: string;
  userId: string;
  species: Species;
  classification: ClassificationResult;
  stateCode: string;
  /** Short note shown in DB — e.g. Wikipedia lead or empty */
  description?: string | null;
};

/**
 * Maps Postgres unique violations for `one_species_per_day` (when that index exists).
 * While repeats are allowed, run `sql/disable_one_species_per_day_temp.sql` so inserts are not blocked.
 */
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
export async function saveDetection(input: SaveDetectionInput): Promise<SaveDetectionResult> {
  const { localImageUri, userId, species, classification, stateCode, description = null } = input;

  const nat = await lookupNativeStatus(species.latinName, stateCode.trim());
  const inaturalistId = nat ? String(nat.taxonId) : null;

  const ext = localImageUri.toLowerCase().includes('.png') ? 'png' : 'jpg';
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const objectPath = `${userId}/${randomUUID()}.${ext}`;

  // Do not use `fetch(localUri)` for camera files — on Android it often throws "Network request failed".
  const base64 = await readLocalFileAsBase64(localImageUri);
  const bytes = decode(base64);

  try {
    await uploadDetectionsObject(objectPath, bytes, { contentType, upsert: false });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    devLog('[saveDetection] Image not uploaded', {
      bucket: DETECTIONS_BUCKET,
      path: objectPath,
      error: msg,
    });
    throw e instanceof Error ? e : new Error(msg);
  }

  devLog('[saveDetection] Image uploaded', { bucket: DETECTIONS_BUCKET, path: objectPath });

  const publicUrl = getDetectionsObjectPublicUrl(objectPath);

  const category = classificationToSpeciesCategory(classification);
  const nativeStatus = speciesStatusToNativeColumn(species.status as SpeciesStatus);
  const confidencePct = Math.min(
    100,
    Math.max(0, Math.round(Number(classification.confidence) * 10000) / 100)
  );

  const { data: inserted, error: insertError } = await supabase
    .from('detections')
    .insert({
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
    })
    .select('id')
    .single();

  if (insertError) {
    await removeDetectionsObjects([objectPath]);
    if (isDuplicateSpeciesTodayError(insertError.message)) {
      throw new Error(
        'You already saved this species today. Try again tomorrow or save a different identification.'
      );
    }
    throw insertError;
  }

  const detectionId = inserted.id as string;
  let newSpeciesDiscovery: NewSpeciesDiscovery | null = null;

  const { data: discoveryRow, error: discoveryError } = await supabase
    .from('discoveries')
    .select('id')
    .eq('detection_id', detectionId)
    .maybeSingle();

  if (!discoveryError && discoveryRow) {
    newSpeciesDiscovery = {
      commonName: species.commonName,
      latinName: species.latinName,
      bonusPoints: FIRST_SPECIES_DISCOVERY_BONUS_POINTS,
    };
  }

  return { detectionId, newSpeciesDiscovery };
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
    await removeDetectionsObjects([storagePath]);
  }
}
