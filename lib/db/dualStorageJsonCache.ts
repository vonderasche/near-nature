import AsyncStorage from '@react-native-async-storage/async-storage';

import { isSqliteUserCacheAvailable } from '@/lib/db/sqliteCacheSupport';

export async function removeAsyncStorageKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key).catch(() => {});
}

export async function removeAsyncStorageKeysByPrefix(prefix: string): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const ours = keys.filter((key) => key.startsWith(prefix));
  if (ours.length > 0) {
    await AsyncStorage.multiRemove(ours);
  }
}

/** SQLite on native; AsyncStorage on web and in tests. */
export async function loadDualStorageJson<T>(options: {
  loadSqliteJson: () => Promise<string | null>;
  asyncStorageKey: string;
  parse: (raw: string | null) => T | null;
  migrateSqlite?: (json: string) => Promise<void>;
}): Promise<T | null> {
  const { loadSqliteJson, asyncStorageKey, parse, migrateSqlite } = options;

  if (isSqliteUserCacheAvailable()) {
    const fromSqlite = parse(await loadSqliteJson());
    if (fromSqlite) return fromSqlite;
  }

  const rawAsync = await AsyncStorage.getItem(asyncStorageKey);
  const fromAsync = parse(rawAsync);
  if (fromAsync && isSqliteUserCacheAvailable() && migrateSqlite && rawAsync) {
    await migrateSqlite(rawAsync);
    await removeAsyncStorageKey(asyncStorageKey);
  }
  return fromAsync;
}

export async function saveDualStorageJson(options: {
  asyncStorageKey: string;
  json: string;
  saveSqlite: () => Promise<void>;
}): Promise<void> {
  if (isSqliteUserCacheAvailable()) {
    await options.saveSqlite();
    await removeAsyncStorageKey(options.asyncStorageKey);
    return;
  }
  await AsyncStorage.setItem(options.asyncStorageKey, options.json);
}

export async function clearDualStorageEntry(options: {
  asyncStorageKey: string;
  clearSqlite: () => Promise<void>;
}): Promise<void> {
  await Promise.all([options.clearSqlite(), removeAsyncStorageKey(options.asyncStorageKey)]);
}

export async function clearAllDualStorageByPrefix(
  keyPrefix: string,
  clearAllSqlite: () => Promise<void>,
): Promise<void> {
  await Promise.all([clearAllSqlite(), removeAsyncStorageKeysByPrefix(keyPrefix)]);
}
