import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  SIGNED_URL_CACHE_KEY_PREFIX,
  SIGNED_URL_PERSISTED_VERSION,
} from '@/constants/signed-url-cache';
import { isSqliteUserCacheAvailable } from '@/lib/db/sqliteCacheSupport';
import {
  clearAllSignedUrlCaches,
  deleteSignedUrlsFromCache,
  loadSignedUrlFromCache,
  loadSignedUrlsFromCache,
  saveSignedUrlToCache,
} from '@/lib/db/userCacheRepository';

type PersistedSignedUrl = {
  v: typeof SIGNED_URL_PERSISTED_VERSION;
  signedUrl: string;
  expiresAtMs: number;
};

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

function storageKey(objectPath: string): string {
  return `${SIGNED_URL_CACHE_KEY_PREFIX}${objectPath}`;
}

function parseEntry(raw: string | null): PersistedSignedUrl | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedSignedUrl;
    if (parsed.v !== SIGNED_URL_PERSISTED_VERSION) return null;
    if (typeof parsed.signedUrl !== 'string' || typeof parsed.expiresAtMs !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function isFresh(expiresAtMs: number, now: number): boolean {
  return expiresAtMs - REFRESH_BUFFER_MS > now;
}

export async function loadPersistedSignedUrl(objectPath: string): Promise<string | null> {
  const trimmed = objectPath.trim();
  if (!trimmed) return null;

  const now = Date.now();

  if (isSqliteUserCacheAvailable()) {
    const row = await loadSignedUrlFromCache(trimmed);
    if (row && isFresh(row.expires_at_ms, now)) {
      return row.signed_url;
    }
    if (row) {
      await deleteSignedUrlsFromCache([trimmed]);
    }
  }

  const raw = await AsyncStorage.getItem(storageKey(trimmed));
  const entry = parseEntry(raw);
  if (!entry || !isFresh(entry.expiresAtMs, now)) {
    if (entry) {
      await AsyncStorage.removeItem(storageKey(trimmed)).catch(() => {});
    }
    return null;
  }

  if (isSqliteUserCacheAvailable()) {
    await saveSignedUrlToCache(trimmed, entry.signedUrl, entry.expiresAtMs, SIGNED_URL_PERSISTED_VERSION);
    await AsyncStorage.removeItem(storageKey(trimmed)).catch(() => {});
  }

  return entry.signedUrl;
}

export async function loadPersistedSignedUrlMap(
  objectPaths: readonly string[],
): Promise<Map<string, string>> {
  const trimmed = [...new Set(objectPaths.map((p) => p.trim()).filter(Boolean))];
  if (trimmed.length === 0) return new Map();

  const now = Date.now();
  const out = new Map<string, string>();
  const stalePaths: string[] = [];
  const staleAsyncKeys: string[] = [];

  if (isSqliteUserCacheAvailable()) {
    const rows = await loadSignedUrlsFromCache(trimmed);
    const found = new Set<string>();
    for (const row of rows) {
      found.add(row.object_path);
      if (isFresh(row.expires_at_ms, now)) {
        out.set(row.object_path, row.signed_url);
      } else {
        stalePaths.push(row.object_path);
      }
    }
    for (const path of trimmed) {
      if (!found.has(path)) {
        // fall through to AsyncStorage below per path
      }
    }
    if (stalePaths.length > 0) {
      await deleteSignedUrlsFromCache(stalePaths);
    }
  }

  const missingFromSqlite = trimmed.filter((p) => !out.has(p));
  if (missingFromSqlite.length > 0) {
    const keys = missingFromSqlite.map(storageKey);
    const pairs = await AsyncStorage.multiGet(keys);

    for (let i = 0; i < missingFromSqlite.length; i++) {
      const path = missingFromSqlite[i]!;
      const entry = parseEntry(pairs[i]?.[1] ?? null);
      if (!entry || !isFresh(entry.expiresAtMs, now)) {
        if (entry) staleAsyncKeys.push(keys[i]!);
        continue;
      }
      out.set(path, entry.signedUrl);
      if (isSqliteUserCacheAvailable()) {
        await saveSignedUrlToCache(path, entry.signedUrl, entry.expiresAtMs, SIGNED_URL_PERSISTED_VERSION);
        staleAsyncKeys.push(keys[i]!);
      }
    }
  }

  if (staleAsyncKeys.length > 0) {
    await AsyncStorage.multiRemove(staleAsyncKeys).catch(() => {});
  }

  return out;
}

export async function persistSignedUrl(
  objectPath: string,
  signedUrl: string,
  expiresAtMs: number,
): Promise<void> {
  const trimmed = objectPath.trim();
  if (!trimmed || !signedUrl.trim()) return;

  if (isSqliteUserCacheAvailable()) {
    await saveSignedUrlToCache(trimmed, signedUrl.trim(), expiresAtMs, SIGNED_URL_PERSISTED_VERSION);
    await AsyncStorage.removeItem(storageKey(trimmed)).catch(() => {});
    return;
  }

  const payload: PersistedSignedUrl = {
    v: SIGNED_URL_PERSISTED_VERSION,
    signedUrl: signedUrl.trim(),
    expiresAtMs,
  };
  await AsyncStorage.setItem(storageKey(trimmed), JSON.stringify(payload));
}

export async function clearPersistedSignedUrls(): Promise<void> {
  await Promise.all([
    clearAllSignedUrlCaches(),
    AsyncStorage.getAllKeys().then((keys) => {
      const ours = keys.filter((k) => k.startsWith(SIGNED_URL_CACHE_KEY_PREFIX));
      return ours.length > 0 ? AsyncStorage.multiRemove(ours) : undefined;
    }),
  ]);
}
