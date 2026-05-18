import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  SIGNED_URL_CACHE_KEY_PREFIX,
  SIGNED_URL_PERSISTED_VERSION,
} from '@/constants/signed-url-cache';

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

export async function loadPersistedSignedUrl(objectPath: string): Promise<string | null> {
  const trimmed = objectPath.trim();
  if (!trimmed) return null;

  const now = Date.now();
  const raw = await AsyncStorage.getItem(storageKey(trimmed));
  const entry = parseEntry(raw);
  if (!entry || entry.expiresAtMs - REFRESH_BUFFER_MS <= now) {
    if (entry) {
      await AsyncStorage.removeItem(storageKey(trimmed)).catch(() => {});
    }
    return null;
  }
  return entry.signedUrl;
}

export async function loadPersistedSignedUrlMap(
  objectPaths: readonly string[],
): Promise<Map<string, string>> {
  const trimmed = [...new Set(objectPaths.map((p) => p.trim()).filter(Boolean))];
  if (trimmed.length === 0) return new Map();

  const keys = trimmed.map(storageKey);
  const pairs = await AsyncStorage.multiGet(keys);
  const now = Date.now();
  const out = new Map<string, string>();
  const staleKeys: string[] = [];

  for (let i = 0; i < trimmed.length; i++) {
    const path = trimmed[i]!;
    const entry = parseEntry(pairs[i]?.[1] ?? null);
    if (!entry || entry.expiresAtMs - REFRESH_BUFFER_MS <= now) {
      if (entry) staleKeys.push(keys[i]!);
      continue;
    }
    out.set(path, entry.signedUrl);
  }

  if (staleKeys.length > 0) {
    await AsyncStorage.multiRemove(staleKeys).catch(() => {});
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

  const payload: PersistedSignedUrl = {
    v: SIGNED_URL_PERSISTED_VERSION,
    signedUrl: signedUrl.trim(),
    expiresAtMs,
  };
  await AsyncStorage.setItem(storageKey(trimmed), JSON.stringify(payload));
}

export async function clearPersistedSignedUrls(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const ours = keys.filter((k) => k.startsWith(SIGNED_URL_CACHE_KEY_PREFIX));
  if (ours.length > 0) {
    await AsyncStorage.multiRemove(ours);
  }
}
