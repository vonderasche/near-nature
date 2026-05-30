import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  SCORING_SNAPSHOT_CACHE_KEY_PREFIX,
  SCORING_SNAPSHOT_CACHE_VERSION,
} from '@/constants/scoring-cache';
import { isSqliteUserCacheAvailable } from '@/lib/db/sqliteCacheSupport';
import {
  clearAllScoringSnapshotCaches,
  deleteScoringSnapshotCache,
  loadScoringSnapshotCacheJson,
  saveScoringSnapshotCacheJson,
} from '@/lib/db/userCacheRepository';
import type { UserScoringSnapshot } from '@/services/scoringSnapshotService';

type StoredScoringSnapshot = Omit<UserScoringSnapshot, 'awardKeys'> & {
  awardKeysList: string[];
};

type CachedEnvelope = {
  v: typeof SCORING_SNAPSHOT_CACHE_VERSION;
  snapshot: StoredScoringSnapshot;
  cachedAt: number;
};

function cacheKey(userId: string): string {
  return `${SCORING_SNAPSHOT_CACHE_KEY_PREFIX}${userId}`;
}

function toStored(snapshot: UserScoringSnapshot): StoredScoringSnapshot {
  const { awardKeys, ...rest } = snapshot;
  return { ...rest, awardKeysList: [...awardKeys] };
}

function fromStored(stored: StoredScoringSnapshot): UserScoringSnapshot {
  const { awardKeysList, ...rest } = stored;
  return { ...rest, awardKeys: new Set(awardKeysList) };
}

function parseEnvelope(raw: string | null): CachedEnvelope | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachedEnvelope;
    if (parsed.v !== SCORING_SNAPSHOT_CACHE_VERSION) return null;
    if (!parsed.snapshot?.mains || !parsed.snapshot?.breakdown) return null;
    if (typeof parsed.cachedAt !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

async function loadFromAsyncStorage(userId: string): Promise<UserScoringSnapshot | null> {
  const envelope = parseEnvelope(await AsyncStorage.getItem(cacheKey(userId)));
  return envelope ? fromStored(envelope.snapshot) : null;
}

export async function loadCachedScoringSnapshot(userId: string): Promise<UserScoringSnapshot | null> {
  if (isSqliteUserCacheAvailable()) {
    const envelope = parseEnvelope(await loadScoringSnapshotCacheJson(userId));
    if (envelope) return fromStored(envelope.snapshot);
  }

  const fromAsync = await loadFromAsyncStorage(userId);
  if (fromAsync && isSqliteUserCacheAvailable()) {
    const entry: CachedEnvelope = {
      v: SCORING_SNAPSHOT_CACHE_VERSION,
      snapshot: toStored(fromAsync),
      cachedAt: Date.now(),
    };
    await saveScoringSnapshotCacheJson(
      userId,
      JSON.stringify(entry),
      entry.cachedAt,
      SCORING_SNAPSHOT_CACHE_VERSION,
    );
    await AsyncStorage.removeItem(cacheKey(userId)).catch(() => {});
  }
  return fromAsync;
}

export async function saveCachedScoringSnapshot(
  userId: string,
  snapshot: UserScoringSnapshot,
): Promise<void> {
  const entry: CachedEnvelope = {
    v: SCORING_SNAPSHOT_CACHE_VERSION,
    snapshot: toStored(snapshot),
    cachedAt: Date.now(),
  };
  const json = JSON.stringify(entry);

  if (isSqliteUserCacheAvailable()) {
    await saveScoringSnapshotCacheJson(
      userId,
      json,
      entry.cachedAt,
      SCORING_SNAPSHOT_CACHE_VERSION,
    );
    await AsyncStorage.removeItem(cacheKey(userId)).catch(() => {});
    return;
  }

  await AsyncStorage.setItem(cacheKey(userId), json);
}

export async function clearCachedScoringSnapshot(userId: string): Promise<void> {
  await Promise.all([
    deleteScoringSnapshotCache(userId),
    AsyncStorage.removeItem(cacheKey(userId)),
  ]);
}

/** Drops device cache so the next scoring load refetches (e.g. after save/delete). */
export async function invalidateCachedScoringSnapshot(userId: string): Promise<void> {
  await clearCachedScoringSnapshot(userId);
}

export async function clearAllCachedScoringSnapshots(): Promise<void> {
  await Promise.all([
    clearAllScoringSnapshotCaches(),
    AsyncStorage.getAllKeys().then((keys) => {
      const ours = keys.filter((k) => k.startsWith(SCORING_SNAPSHOT_CACHE_KEY_PREFIX));
      return ours.length > 0 ? AsyncStorage.multiRemove(ours) : undefined;
    }),
  ]);
}
