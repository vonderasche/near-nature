import { getLocalDatabase, isLocalDatabaseSupported } from '@/lib/db/database';

/** True when expo-sqlite is open and ready for user cache reads/writes. */
export function isSqliteUserCacheAvailable(): boolean {
  return isLocalDatabaseSupported() && getLocalDatabase() != null;
}
