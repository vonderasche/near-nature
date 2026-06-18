import { devLog } from '@/lib/devLog';
import { openLocalDatabase, isLocalDatabaseSupported, markLocalDatabaseReady } from '@/lib/db/database';
import { runPendingMigrations } from '@/lib/db/migrations';
import { LATEST_DB_MIGRATION_VERSION } from '@/lib/db/migrations/index';
import { migrateLegacyAsyncStorageCacheIfNeeded } from '@/lib/db/migrateLegacyAsyncStorageCache';
import { seedSpeciesCatalogIfNeeded } from '@/lib/db/seedSpeciesCatalog';

let initPromise: Promise<void> | null = null;

export async function initLocalDatabase(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (!isLocalDatabaseSupported()) {
      devLog('[db] skipped on web');
      return;
    }

    const db = await openLocalDatabase();
    if (!db) return;

    await runPendingMigrations(db);
    await seedSpeciesCatalogIfNeeded();
    await migrateLegacyAsyncStorageCacheIfNeeded();

    markLocalDatabaseReady();
    devLog('[db] ready', { migrationVersion: LATEST_DB_MIGRATION_VERSION });
  })().catch((error) => {
    initPromise = null;
    devLog('[db] init failed', error);
    throw error;
  });

  return initPromise;
}
