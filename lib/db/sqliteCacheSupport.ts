import { getLocalDatabase, isLocalDatabaseReady, isLocalDatabaseSupported } from '@/lib/db/database';

/** True when expo-sqlite is open, migrated, and ready for user cache reads/writes. */
export function isSqliteUserCacheAvailable(): boolean {
  return isLocalDatabaseSupported() && isLocalDatabaseReady() && getLocalDatabase() != null;
}
