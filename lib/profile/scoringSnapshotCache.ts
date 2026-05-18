import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  SCORING_SNAPSHOT_CACHE_KEY_PREFIX,
  SCORING_SNAPSHOT_CACHE_VERSION,
} from '@/constants/scoring-cache';
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

export async function loadCachedScoringSnapshot(userId: string): Promise<UserScoringSnapshot | null> {
  const raw = await AsyncStorage.getItem(cacheKey(userId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachedEnvelope;
    if (parsed.v !== SCORING_SNAPSHOT_CACHE_VERSION) return null;
    if (!parsed.snapshot?.mains || !parsed.snapshot?.breakdown) return null;
    return fromStored(parsed.snapshot);
  } catch {
    return null;
  }
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
  await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(entry));
}

export async function clearCachedScoringSnapshot(userId: string): Promise<void> {
  await AsyncStorage.removeItem(cacheKey(userId));
}

/** Drops device cache so the next scoring load refetches (e.g. after save/delete). */
export async function invalidateCachedScoringSnapshot(userId: string): Promise<void> {
  await clearCachedScoringSnapshot(userId);
}

export async function clearAllCachedScoringSnapshots(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const ours = keys.filter((k) => k.startsWith(SCORING_SNAPSHOT_CACHE_KEY_PREFIX));
  if (ours.length > 0) {
    await AsyncStorage.multiRemove(ours);
  }
}
