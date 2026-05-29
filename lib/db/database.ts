import { Platform } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';

export const LOCAL_DATABASE_NAME = 'near_nature.db';

let database: SQLiteDatabase | null = null;

export function isLocalDatabaseSupported(): boolean {
  return Platform.OS !== 'web';
}

export async function openLocalDatabase(): Promise<SQLiteDatabase | null> {
  if (!isLocalDatabaseSupported()) return null;
  if (database) return database;
  database = await SQLite.openDatabaseAsync(LOCAL_DATABASE_NAME);
  await database.execAsync('PRAGMA foreign_keys = ON;');
  return database;
}

export function getLocalDatabase(): SQLiteDatabase | null {
  return database;
}

export async function withDbTransaction<T>(
  fn: (db: SQLiteDatabase) => Promise<T>,
): Promise<T | null> {
  const db = getLocalDatabase();
  if (!db) return null;
  let result: T;
  await db.withTransactionAsync(async () => {
    result = await fn(db);
  });
  return result!;
}
