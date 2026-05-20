import { decode } from 'base64-arraybuffer';
import { randomUUID } from 'expo-crypto';
import { readLocalFileAsBase64 } from '@/lib/fs/legacyFileSystem';

import { fetchTaxonAlternateNames, lookupNativeStatus } from '@/api/inaturalist';
import { isLocalDetectionsMode } from '@/lib/config/isLocalDetectionsMode';
import { DETECTIONS_BUCKET } from '@/lib/detections/detectionsBucket';
import { appendLocalDetection, removeLocalDetection } from '@/lib/detections/localDetectionStore';
import {
  getDetectionsObjectPublicUrl,
  removeDetectionsObjects,
  uploadDetectionsObject,
} from '@/lib/detections/detectionsStorage';
import { invalidateCachedGalleryList } from '@/lib/detections/galleryListCache';
import { upsertSavedSpeciesInSession } from '@/lib/identification/savedSpeciesSessionCache';
import { invalidateCachedScoringSnapshot } from '@/lib/profile/scoringSnapshotCache';
import { upsertSpeciesMetadata } from '@/services/speciesMetadataService';
import { classificationToSpeciesCategory } from '@/lib/detections/mapSpeciesCategory';
import { resolveNaturalistCategoryFromClassification } from '@/lib/points/resolveNaturalistCategory';
import { speciesStatusToNativeColumn } from '@/lib/detections/mapNativeStatusDb';
import { formatSupabaseError } from '@/lib/errors/errorMessage';
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
 * Uploads the local image to Supabase Storage (`detections/{userId}/...`) and inserts `public.detections`.
 */
export async function saveDetection(input: SaveDetectionInput): Promise<SaveDetectionResult> {
  const { localImageUri, userId, species, classification, stateCode, description = null } = input;

  if (isLocalDetectionsMode()) {
    const { detectionId } = await appendLocalDetection({
      localImageUri,
      userId,
      species,
      classification,
      description,
    });
    await invalidateCachedGalleryList(userId);
    await invalidateCachedScoringSnapshot(userId);
    upsertSavedSpeciesInSession(userId, {
      latinName: species.latinName,
      commonName: species.commonName,
      status: species.status,
      description: input.description,
      inaturalistId: null,
    });
    devLog('[saveDetection] saved locally (device-only mode)', { detectionId });
    return { detectionId, newSpeciesDiscovery: null };
  }

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
  const { subcategory, mainCategory } = resolveNaturalistCategoryFromClassification(classification);
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
      subcategory,
      main_category: mainCategory,
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
    devLog('[saveDetection] insert failed', {
      message: insertError.message,
      code: insertError.code,
      details: insertError.details,
      hint: insertError.hint,
      category,
      subcategory,
      mainCategory,
      nativeStatus,
      state: stateCode.trim().toUpperCase().slice(0, 2),
    });
    const detail = formatSupabaseError(insertError);
    throw new Error(detail || insertError.message || 'Could not save detection row.');
  }

  const detectionId = inserted.id as string;

  void (async () => {
    try {
      const aliases = await fetchTaxonAlternateNames(species.latinName);
      await upsertSpeciesMetadata({
        latinName: species.latinName,
        commonName: species.commonName,
        aliases,
      });
    } catch (e) {
      devLog('[saveDetection] species metadata upsert failed', e);
    }
  })();

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

  await invalidateCachedGalleryList(userId);
  await invalidateCachedScoringSnapshot(userId);

  upsertSavedSpeciesInSession(userId, {
    latinName: species.latinName,
    commonName: species.commonName,
    status: species.status,
    description: input.description,
    inaturalistId: inaturalistId,
  });

  return { detectionId, newSpeciesDiscovery };
}

/**
 * Deletes the current user's detection row (RLS) and best-effort removes the image from Storage.
 */
export async function deleteSavedDetection(detectionId: string): Promise<void> {
  if (isLocalDetectionsMode()) {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;
    if (!userId) {
      throw new Error('Sign in to manage saved photos.');
    }
    await removeLocalDetection(userId, detectionId);
    await invalidateCachedGalleryList(userId);
    await invalidateCachedScoringSnapshot(userId);
    return;
  }

  const { data: row, error: selectError } = await supabase
    .from('detections')
    .select('image_url, user_id')
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

  if (row.user_id) {
    const uid = String(row.user_id);
    await invalidateCachedGalleryList(uid);
    await invalidateCachedScoringSnapshot(uid);
  }

  if (storagePath) {
    await removeDetectionsObjects([storagePath]);
  }
}
