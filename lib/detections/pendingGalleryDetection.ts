import { randomUUID } from 'expo-crypto';

import { mapRowNativeStatus } from '@/lib/detections/galleryNativeCategory';
import { speciesStatusToNativeColumn } from '@/lib/detections/mapNativeStatusDb';
import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';
import type { DetectionGalleryItem, SpeciesStatus } from '@/types';

export type PendingGalleryDetectionInput = {
  userId: string;
  localImageUri: string;
  commonName: string;
  latinName: string;
  category: string;
  subcategory: string | null;
  mainCategory: string | null;
  description: string | null;
  nativeStatus: SpeciesStatus;
};

type PendingEntry = {
  pendingId: string;
  userId: string;
  localImageUri: string;
  row: DetectionGalleryRow;
};

const pendingByUser = new Map<string, PendingEntry[]>();

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribePendingGalleryDetection(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyPendingGalleryChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function createPendingGalleryDetectionId(): string {
  return `pending:${randomUUID()}`;
}

/** Registers an optimistic gallery tile (local `file://` image) before upload finishes. */
export function addPendingGalleryDetection(
  pendingId: string,
  input: PendingGalleryDetectionInput,
): void {
  const trimmedUri = input.localImageUri.trim();
  if (!trimmedUri || !input.userId) return;

  const row: DetectionGalleryRow = {
    id: pendingId,
    image_url: trimmedUri,
    detected_at: new Date().toISOString(),
    common_name: input.commonName,
    latin_name: input.latinName,
    category: input.category,
    subcategory: input.subcategory,
    main_category: input.mainCategory,
    description: input.description?.trim() ? input.description.trim().slice(0, 8000) : null,
    native_status: speciesStatusToNativeColumn(input.nativeStatus),
  };

  const entry: PendingEntry = {
    pendingId,
    userId: input.userId,
    localImageUri: trimmedUri,
    row,
  };

  const list = pendingByUser.get(input.userId) ?? [];
  pendingByUser.set(input.userId, [entry, ...list.filter((p) => p.pendingId !== pendingId)]);
  notifyPendingGalleryChange();
}

export function removePendingGalleryDetection(pendingId: string, userId?: string): void {
  let removed = false;
  if (userId) {
    const list = pendingByUser.get(userId);
    if (list) {
      const next = list.filter((p) => p.pendingId !== pendingId);
      if (next.length !== list.length) {
        removed = true;
        if (next.length === 0) pendingByUser.delete(userId);
        else pendingByUser.set(userId, next);
      }
    }
  } else {
    for (const [uid, list] of pendingByUser) {
      const next = list.filter((p) => p.pendingId !== pendingId);
      if (next.length !== list.length) {
        removed = true;
        if (next.length === 0) pendingByUser.delete(uid);
        else pendingByUser.set(uid, next);
      }
    }
  }
  if (removed) notifyPendingGalleryChange();
}

export function clearPendingGalleryDetectionsForUser(userId: string): void {
  if (pendingByUser.delete(userId)) notifyPendingGalleryChange();
}

export function clearAllPendingGalleryDetections(): void {
  if (pendingByUser.size === 0) return;
  pendingByUser.clear();
  notifyPendingGalleryChange();
}

export function getPendingGalleryRows(userId: string): DetectionGalleryRow[] {
  return (pendingByUser.get(userId) ?? []).map((p) => p.row);
}

export function pendingRowToGalleryItem(row: DetectionGalleryRow): DetectionGalleryItem {
  const { nativeStatus, nativeCategory } = mapRowNativeStatus(row.native_status);
  const description =
    typeof row.description === 'string' && row.description.trim().length > 0
      ? row.description.trim()
      : null;

  return {
    id: row.id,
    imageUrl: row.image_url,
    displayUrl: row.image_url.trim(),
    detectedAt: row.detected_at,
    commonName: row.common_name,
    latinName: row.latin_name,
    category: String(row.category ?? 'other'),
    subcategory: row.subcategory?.trim() ? row.subcategory.trim() : null,
    mainCategory: row.main_category?.trim() ? row.main_category.trim() : null,
    description,
    nativeStatus,
    nativeCategory,
    uploadStatus: 'pending',
  };
}

export function getPendingGalleryItems(userId: string): DetectionGalleryItem[] {
  return getPendingGalleryRows(userId).map(pendingRowToGalleryItem);
}

/** Own-profile gallery: pending tiles first, then server rows (deduped by id). */
export function mergePendingAndServerGalleryItems(
  pending: readonly DetectionGalleryItem[],
  server: readonly DetectionGalleryItem[],
): DetectionGalleryItem[] {
  const serverIds = new Set(server.map((s) => s.id));
  const filteredPending = pending.filter((p) => !serverIds.has(p.id));
  return [...filteredPending, ...server];
}
