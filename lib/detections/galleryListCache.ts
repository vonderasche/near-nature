import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  GALLERY_LIST_CACHE_KEY_PREFIX,
  GALLERY_LIST_CACHE_VERSION,
} from '@/constants/gallery-cache';
import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';

export type CachedGalleryList = {
  v: typeof GALLERY_LIST_CACHE_VERSION;
  userId: string;
  publicOnly: boolean;
  rows: DetectionGalleryRow[];
  hasMore: boolean;
  cachedAt: number;
};

function cacheKey(userId: string, publicOnly: boolean): string {
  return `${GALLERY_LIST_CACHE_KEY_PREFIX}${userId}:${publicOnly ? 'public' : 'all'}`;
}

function isGalleryRow(value: unknown): value is DetectionGalleryRow {
  if (!value || typeof value !== 'object') return false;
  const r = value as DetectionGalleryRow;
  return (
    typeof r.id === 'string' &&
    typeof r.image_url === 'string' &&
    typeof r.detected_at === 'string' &&
    typeof r.common_name === 'string' &&
    typeof r.latin_name === 'string' &&
    typeof r.category === 'string'
  );
}

function parseCachedGalleryList(raw: string | null): CachedGalleryList | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachedGalleryList;
    if (parsed.v !== GALLERY_LIST_CACHE_VERSION) return null;
    if (typeof parsed.userId !== 'string' || typeof parsed.hasMore !== 'boolean') return null;
    if (typeof parsed.publicOnly !== 'boolean') return null;
    if (!Array.isArray(parsed.rows) || !parsed.rows.every(isGalleryRow)) return null;
    if (typeof parsed.cachedAt !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function dedupeRowsById(rows: readonly DetectionGalleryRow[]): DetectionGalleryRow[] {
  const seen = new Set<string>();
  const out: DetectionGalleryRow[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

export async function loadCachedGalleryList(
  userId: string,
  publicOnly: boolean,
): Promise<CachedGalleryList | null> {
  const raw = await AsyncStorage.getItem(cacheKey(userId, publicOnly));
  const cached = parseCachedGalleryList(raw);
  if (!cached || cached.userId !== userId || cached.publicOnly !== publicOnly) return null;
  return cached;
}

export async function saveCachedGalleryList(
  userId: string,
  publicOnly: boolean,
  payload: { rows: readonly DetectionGalleryRow[]; hasMore: boolean },
): Promise<void> {
  const entry: CachedGalleryList = {
    v: GALLERY_LIST_CACHE_VERSION,
    userId,
    publicOnly,
    rows: dedupeRowsById(payload.rows),
    hasMore: payload.hasMore,
    cachedAt: Date.now(),
  };
  await AsyncStorage.setItem(cacheKey(userId, publicOnly), JSON.stringify(entry));
}

/** Prepends a saved row after upload (keeps existing cache entries below). */
export async function prependCachedGalleryRow(
  userId: string,
  publicOnly: boolean,
  row: DetectionGalleryRow,
): Promise<void> {
  const cached = await loadCachedGalleryList(userId, publicOnly);
  const existing = cached?.rows ?? [];
  const rows = dedupeRowsById([row, ...existing.filter((r) => r.id !== row.id)]);
  await saveCachedGalleryList(userId, publicOnly, {
    rows,
    hasMore: cached?.hasMore ?? true,
  });
}

export async function invalidateCachedGalleryList(
  userId: string,
  publicOnly?: boolean,
): Promise<void> {
  if (publicOnly === undefined) {
    await Promise.all([
      AsyncStorage.removeItem(cacheKey(userId, false)),
      AsyncStorage.removeItem(cacheKey(userId, true)),
    ]);
    return;
  }
  await AsyncStorage.removeItem(cacheKey(userId, publicOnly));
}

export async function clearAllCachedGalleryLists(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const ours = keys.filter((k) => k.startsWith(GALLERY_LIST_CACHE_KEY_PREFIX));
  if (ours.length > 0) {
    await AsyncStorage.multiRemove(ours);
  }
}
