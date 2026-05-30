import {
  SCORING_SNAPSHOT_CACHE_KEY_PREFIX,
  SCORING_SNAPSHOT_CACHE_VERSION,
} from '@/constants/scoring-cache';
import {
  clearAllDualStorageByPrefix,
  clearDualStorageEntry,
  loadDualStorageJson,
  saveDualStorageJson,
} from '@/lib/db/dualStorageJsonCache';
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

function envelopeToSnapshot(envelope: CachedEnvelope | null): UserScoringSnapshot | null {
  return envelope ? fromStored(envelope.snapshot) : null;
}

async function loadCachedScoringSnapshotEnvelope(userId: string): Promise<CachedEnvelope | null> {
  return loadDualStorageJson({
    loadSqliteJson: () => loadScoringSnapshotCacheJson(userId),
    asyncStorageKey: cacheKey(userId),
    parse: parseEnvelope,
    migrateSqlite: (json) => {
      const parsed = parseEnvelope(json);
      if (!parsed) return Promise.resolve();
      return saveScoringSnapshotCacheJson(
        userId,
        json,
        parsed.cachedAt,
        SCORING_SNAPSHOT_CACHE_VERSION,
      );
    },
  });
}

export async function loadCachedScoringSnapshot(userId: string): Promise<UserScoringSnapshot | null> {
  const envelope = await loadCachedScoringSnapshotEnvelope(userId);
  return envelopeToSnapshot(envelope);
}

export async function loadCachedScoringSnapshotEntry(
  userId: string,
): Promise<{ value: UserScoringSnapshot; cachedAt: number } | null> {
  const envelope = await loadCachedScoringSnapshotEnvelope(userId);
  const snapshot = envelopeToSnapshot(envelope);
  if (!envelope || !snapshot) return null;
  return { value: snapshot, cachedAt: envelope.cachedAt };
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

  await saveDualStorageJson({
    asyncStorageKey: cacheKey(userId),
    json,
    saveSqlite: () =>
      saveScoringSnapshotCacheJson(
        userId,
        json,
        entry.cachedAt,
        SCORING_SNAPSHOT_CACHE_VERSION,
      ),
  });
}

export async function clearCachedScoringSnapshot(userId: string): Promise<void> {
  await clearDualStorageEntry({
    asyncStorageKey: cacheKey(userId),
    clearSqlite: () => deleteScoringSnapshotCache(userId),
  });
}

/** Drops device cache so the next scoring load refetches (e.g. after save/delete). */
export async function invalidateCachedScoringSnapshot(userId: string): Promise<void> {
  await clearCachedScoringSnapshot(userId);
}

export async function clearAllCachedScoringSnapshots(): Promise<void> {
  await clearAllDualStorageByPrefix(SCORING_SNAPSHOT_CACHE_KEY_PREFIX, clearAllScoringSnapshotCaches);
}
