import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';

import { LOCAL_DETECTIONS_STORAGE_KEY_PREFIX } from '@/constants/local-detections';
import {
  deleteUserDetection,
  listUserDetectionGalleryRows,
  upsertUserDetection,
} from '@/lib/db/detectionRepository';
import { isSqliteUserCacheAvailable } from '@/lib/db/sqliteCacheSupport';
import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';
import { classificationToSpeciesCategory } from '@/lib/detections/mapSpeciesCategory';
import { speciesStatusToNativeColumn } from '@/lib/detections/mapNativeStatusDb';
import { resolveNaturalistCategoryFromClassification } from '@/lib/points/resolveNaturalistCategory';
import type { ClassificationResult, Species, SpeciesStatus } from '@/types';

function storageKey(userId: string): string {
  return `${LOCAL_DETECTIONS_STORAGE_KEY_PREFIX}${userId}`;
}

function parseRows(raw: string | null): DetectionGalleryRow[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is DetectionGalleryRow =>
        !!row &&
        typeof row === 'object' &&
        typeof (row as DetectionGalleryRow).id === 'string' &&
        typeof (row as DetectionGalleryRow).image_url === 'string',
    );
  } catch {
    return [];
  }
}

async function loadFromAsyncStorage(userId: string): Promise<DetectionGalleryRow[]> {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  return parseRows(raw);
}

async function persistToAsyncStorage(userId: string, rows: DetectionGalleryRow[]): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(rows));
}

export async function loadLocalDetectionRows(userId: string): Promise<DetectionGalleryRow[]> {
  if (isSqliteUserCacheAvailable()) {
    const rows = await listUserDetectionGalleryRows(userId);
    if (rows.length > 0) return rows;
  }

  const fromAsync = await loadFromAsyncStorage(userId);
  if (fromAsync.length > 0 && isSqliteUserCacheAvailable()) {
    for (const row of fromAsync) {
      await upsertUserDetection(userId, row, { isSensitive: false });
    }
    await AsyncStorage.removeItem(storageKey(userId)).catch(() => {});
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

export async function appendLocalDetection(
  input: AppendLocalDetectionInput,
): Promise<{ detectionId: string; row: DetectionGalleryRow }> {
  const { localImageUri, userId, species, classification, description = null } = input;
  const detectionId = randomUUID();
  const category = classificationToSpeciesCategory(classification);
  const naturalist = resolveNaturalistCategoryFromClassification(classification);
  const subcategory = naturalist?.subcategory ?? null;
  const mainCategory = naturalist?.mainCategory ?? null;
  const nativeStatus = speciesStatusToNativeColumn(species.status as SpeciesStatus);

  const row: DetectionGalleryRow = {
    id: detectionId,
    image_url: localImageUri,
    detected_at: new Date().toISOString(),
    common_name: species.commonName,
    latin_name: species.latinName,
    category,
    subcategory,
    main_category: mainCategory,
    description: description?.trim() ? description.trim().slice(0, 8000) : null,
    native_status: nativeStatus,
  };

  if (isSqliteUserCacheAvailable()) {
    await upsertUserDetection(userId, row, {
      confidence: Math.round(Number(classification.confidence) * 10000) / 100,
      isSensitive: false,
    });
    return { detectionId, row };
  }

  const existing = await loadFromAsyncStorage(userId);
  await persistToAsyncStorage(userId, [row, ...existing]);
  return { detectionId, row };
}

export async function removeLocalDetection(userId: string, detectionId: string): Promise<void> {
  if (isSqliteUserCacheAvailable()) {
    await deleteUserDetection(userId, detectionId);
    return;
  }

  const existing = await loadFromAsyncStorage(userId);
  await persistToAsyncStorage(
    userId,
    existing.filter((row) => row.id !== detectionId),
  );
}

export async function clearAllLocalDetections(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const ours = keys.filter((k) => k.startsWith(LOCAL_DETECTIONS_STORAGE_KEY_PREFIX));
  if (ours.length > 0) {
    await AsyncStorage.multiRemove(ours);
  }
}
