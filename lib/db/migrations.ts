import type { SQLiteDatabase } from 'expo-sqlite';

import { DB_MIGRATIONS } from '@/lib/db/migrations/index';

async function getAppliedVersions(db: SQLiteDatabase): Promise<Set<number>> {
  try {
    const rows = await db.getAllAsync<{ version: number }>(
      'SELECT version FROM schema_migrations ORDER BY version ASC',
    );
    return new Set(rows.map((row) => row.version));
  } catch {
    return new Set();
  }
}

export async function runPendingMigrations(db: SQLiteDatabase): Promise<void> {
  const applied = await getAppliedVersions(db);

  for (const migration of DB_MIGRATIONS) {
    if (applied.has(migration.version)) continue;
    await migration.up(db);
    await db.runAsync('INSERT INTO schema_migrations (version) VALUES (?)', migration.version);
    applied.add(migration.version);
  }
}
