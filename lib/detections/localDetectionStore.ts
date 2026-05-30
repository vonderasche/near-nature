import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';

import { LOCAL_DETECTIONS_STORAGE_KEY_PREFIX } from '@/constants/local-detections';
import { removeAsyncStorageKeysByPrefix, removeAsyncStorageKey } from '@/lib/db/dualStorageJsonCache';
import {
  deleteUserDetection,
  listUserDetectionGalleryRows,
  upsertUserDetection,
} from '@/lib/db/detectionRepository';
import { isSqliteUserCacheAvailable } from '@/lib/db/sqliteCacheSupport';
import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';
import { parseLocalDetectionRows } from '@/lib/detections/parseLocalDetectionRows';
import { classificationToSpeciesCategory } from '@/lib/detections/mapSpeciesCategory';
import { speciesStatusToNativeColumn } from '@/lib/detections/mapNativeStatusDb';
import { resolveNaturalistCategoryFromClassification } from '@/lib/points/resolveNaturalistCategory';
import type { ClassificationResult, Species, SpeciesStatus } from '@/types';

function storageKey(userId: string): string {
  return `${LOCAL_DETECTIONS_STORAGE_KEY_PREFIX}${userId}`;
}

async function migrateAsyncLocalDetections(userId: string, rows: DetectionGalleryRow[]): Promise<void> {
  for (const row of rows) {
    await upsertUserDetection(userId, row, { isSensitive: false });
  }
  await removeAsyncStorageKey(storageKey(userId));
}

export async function loadLocalDetectionRows(userId: string): Promise<DetectionGalleryRow[]> {
  if (isSqliteUserCacheAvailable()) {
    const rows = await listUserDetectionGalleryRows(userId);
    if (rows.length > 0) return rows;
  }

  const fromAsync = parseLocalDetectionRows(await AsyncStorage.getItem(storageKey(userId)));
  if (fromAsync.length > 0 && isSqliteUserCacheAvailable()) {
    await migrateAsyncLocalDetections(userId, fromAsync);
  }
  return fromAsync;
}

export type AppendLocalDetectionInput = {
  localImageUri: string;
  userId: string;
  species: Species;
  classification: ClassificationResult;
  description?: string | null;
};

function buildGalleryRow(input: AppendLocalDetectionInput, detectionId: string): DetectionGalleryRow {
  const { localImageUri, species, classification, description = null } = input;
  const category = classificationToSpeciesCategory(classification);
  const naturalist = resolveNaturalistCategoryFromClassification(classification);
  const nativeStatus = speciesStatusToNativeColumn(species.status as SpeciesStatus);

  return {
    id: detectionId,
    image_url: localImageUri,
    detected_at: new Date().toISOString(),
    common_name: species.commonName,
    latin_name: species.latinName,
    category,
    subcategory: naturalist?.subcategory ?? null,
    main_category: naturalist?.mainCategory ?? null,
    description: description?.trim() ? description.trim().slice(0, 8000) : null,
    native_status: nativeStatus,
  };
}

export async function appendLocalDetection(
  input: AppendLocalDetectionInput,
): Promise<{ detectionId: string; row: DetectionGalleryRow }> {
  const detectionId = randomUUID();
  const row = buildGalleryRow(input, detectionId);

  if (isSqliteUserCacheAvailable()) {
    await upsertUserDetection(input.userId, row, {
      confidence: Math.round(Number(input.classification.confidence) * 10000) / 100,
      isSensitive: false,
    });
    return { detectionId, row };
  }

  const existing = parseLocalDetectionRows(await AsyncStorage.getItem(storageKey(input.userId)));
  await AsyncStorage.setItem(storageKey(input.userId), JSON.stringify([row, ...existing]));
  return { detectionId, row };
}

export async function removeLocalDetection(userId: string, detectionId: string): Promise<void> {
  if (isSqliteUserCacheAvailable()) {
    await deleteUserDetection(userId, detectionId);
    return;
  }

  const existing = parseLocalDetectionRows(await AsyncStorage.getItem(storageKey(userId)));
  await AsyncStorage.setItem(
    storageKey(userId),
    JSON.stringify(existing.filter((row) => row.id !== detectionId)),
  );
}

export async function clearAllLocalDetections(): Promise<void> {
  await removeAsyncStorageKeysByPrefix(LOCAL_DETECTIONS_STORAGE_KEY_PREFIX);
}
