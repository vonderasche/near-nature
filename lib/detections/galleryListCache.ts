import {
  GALLERY_LIST_CACHE_KEY_PREFIX,
  GALLERY_LIST_CACHE_VERSION,
} from '@/constants/gallery-cache';
import {
  clearAllDualStorageByPrefix,
  clearDualStorageEntry,
  loadDualStorageJson,
  removeAsyncStorageKey,
  saveDualStorageJson,
} from '@/lib/db/dualStorageJsonCache';
import {
  clearAllGalleryListCaches,
  deleteGalleryListCache,
  loadGalleryListCacheJson,
  saveGalleryListCacheJson,
} from '@/lib/db/userCacheRepository';
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

function validateCachedGalleryList(
  userId: string,
  publicOnly: boolean,
  cached: CachedGalleryList | null,
): CachedGalleryList | null {
  if (!cached || cached.userId !== userId || cached.publicOnly !== publicOnly) return null;
  return cached;
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
  const cached = await loadDualStorageJson({
    loadSqliteJson: () => loadGalleryListCacheJson(userId, publicOnly),
    asyncStorageKey: cacheKey(userId, publicOnly),
    parse: parseCachedGalleryList,
    migrateSqlite: (json) => {
      const parsed = parseCachedGalleryList(json);
      if (!parsed) return Promise.resolve();
      return saveGalleryListCacheJson(
        userId,
        publicOnly,
        json,
        parsed.cachedAt,
        GALLERY_LIST_CACHE_VERSION,
      );
    },
  });
  return validateCachedGalleryList(userId, publicOnly, cached);
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
  const json = JSON.stringify(entry);

  await saveDualStorageJson({
    asyncStorageKey: cacheKey(userId, publicOnly),
    json,
    saveSqlite: () =>
      saveGalleryListCacheJson(
        userId,
        publicOnly,
        json,
        entry.cachedAt,
        GALLERY_LIST_CACHE_VERSION,
      ),
  });
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
      deleteGalleryListCache(userId),
      removeAsyncStorageKey(cacheKey(userId, false)),
      removeAsyncStorageKey(cacheKey(userId, true)),
    ]);
    return;
  }

  await clearDualStorageEntry({
    asyncStorageKey: cacheKey(userId, publicOnly),
    clearSqlite: () => deleteGalleryListCache(userId, publicOnly),
  });
}

export async function clearAllCachedGalleryLists(): Promise<void> {
  await clearAllDualStorageByPrefix(GALLERY_LIST_CACHE_KEY_PREFIX, clearAllGalleryListCaches);
}
