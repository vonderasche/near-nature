import catalog from '@/assets/tflite/near_nature_app_bundle/genus_info/genus_profiles.enriched.min.json';

import { devLog } from '@/lib/devLog';
import { getAppMeta, setAppMeta } from '@/lib/db/appMeta';
import { isLocalDatabaseSupported, getLocalDatabase } from '@/lib/db/database';
import { parseGenusProfiles } from '@/lib/db/parseGenusProfiles';
import {
  clearAllSpeciesRecords,
  countSpeciesRecords,
  upsertSpeciesRecords,
} from '@/lib/db/speciesRepository';
import type { GenusProfilesJson } from '@/types/speciesRecord';

export const SPECIES_CATALOG_SEEDED_META_KEY = 'species_catalog_seeded';
export const SPECIES_CATALOG_VERSION_META_KEY = 'species_catalog_version';

/** Bump when replacing the bundled genus catalog under `near_nature_app_bundle/genus_info/`. */
export const SPECIES_CATALOG_VERSION = 'near_nature_app_bundle/genus_profiles.enriched.min@2026-05-29';

const EXPECTED_GENUS_COUNT = 4000;

export async function seedSpeciesCatalogIfNeeded(): Promise<void> {
  if (!isLocalDatabaseSupported() || !getLocalDatabase()) return;

  const version = await getAppMeta(SPECIES_CATALOG_VERSION_META_KEY);
  const count = await countSpeciesRecords();
  if (version === SPECIES_CATALOG_VERSION && count >= EXPECTED_GENUS_COUNT) return;

  const records = parseGenusProfiles(catalog as GenusProfilesJson);
  if (records.length === 0) return;

  if (count > 0) {
    await clearAllSpeciesRecords();
  }

  await upsertSpeciesRecords(records);
  await setAppMeta(SPECIES_CATALOG_VERSION_META_KEY, SPECIES_CATALOG_VERSION);
  await setAppMeta(SPECIES_CATALOG_SEEDED_META_KEY, String(records.length));
  devLog('[db] species catalog seeded', { count: records.length, version: SPECIES_CATALOG_VERSION });
}
