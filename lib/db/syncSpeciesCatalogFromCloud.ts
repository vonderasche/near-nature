import { getAppMeta, setAppMeta } from '@/lib/db/appMeta';
import { isLocalDatabaseSupported, getLocalDatabase } from '@/lib/db/database';
import { upsertSpeciesRecords } from '@/lib/db/speciesRepository';
import { devLog } from '@/lib/devLog';
import {
  fetchSpeciesCatalogSyncPage,
  speciesCatalogRowToRecord,
} from '@/services/speciesCatalogService';

export const SPECIES_CATALOG_CLOUD_SYNC_AT_META_KEY = 'species_catalog_cloud_sync_at';

const PAGE_SIZE = 500;
const MAX_PAGES = 40;

/**
 * Merges community/enrichment rows from Supabase into local SQLite `species_records`.
 * Bundled genus seed stays on device; cloud adds entries other users discovered via Gemini.
 */
export async function syncSpeciesCatalogFromCloud(): Promise<{ merged: number }> {
  if (!isLocalDatabaseSupported() || !getLocalDatabase()) {
    return { merged: 0 };
  }

  const updatedAfter = await getAppMeta(SPECIES_CATALOG_CLOUD_SYNC_AT_META_KEY);
  let cursor = updatedAfter;
  let merged = 0;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const rows = await fetchSpeciesCatalogSyncPage({
      updatedAfter: cursor,
      limit: PAGE_SIZE,
      offset: 0,
    });

    if (rows.length === 0) break;

    const records = rows.map(speciesCatalogRowToRecord);
    await upsertSpeciesRecords(records);
    merged += records.length;

    const maxUpdatedAt = rows.reduce(
      (max, row) => (row.updated_at > max ? row.updated_at : max),
      cursor ?? '',
    );
    cursor = maxUpdatedAt;

    if (rows.length < PAGE_SIZE) break;
  }

  if (merged > 0 && cursor) {
    await setAppMeta(SPECIES_CATALOG_CLOUD_SYNC_AT_META_KEY, cursor);
  }

  devLog('[species_catalog] cloud sync merged', { merged, updatedAfter });
  return { merged };
}
