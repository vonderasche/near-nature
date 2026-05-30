import type { SpeciesWikiData } from '@/api/wikipedia';
import { getLocalDatabase } from '@/lib/db/database';
import { normalizeLatinName } from '@/lib/identification/normalizeLatinName';

type WikiCacheRow = {
  payload_json: string;
};

function parseWikiPayload(json: string): SpeciesWikiData | null {
  try {
    const parsed = JSON.parse(json) as SpeciesWikiData;
    if (typeof parsed.description !== 'string') return null;
    if (typeof parsed.fullDescription !== 'string') return null;
    if (typeof parsed.pageUrl !== 'string') return null;
    if (!Array.isArray(parsed.funFacts)) return null;

    return {
      description: parsed.description,
      fullDescription: parsed.fullDescription,
      imageUrl: typeof parsed.imageUrl === 'string' ? parsed.imageUrl : null,
      funFacts: parsed.funFacts.filter((fact): fact is string => typeof fact === 'string'),
      pageUrl: parsed.pageUrl,
    };
  } catch {
    return null;
  }
}

/** Loads a previously fetched Wikipedia payload for this Latin name. */
export async function loadWikiCache(latinName: string): Promise<SpeciesWikiData | null> {
  const db = getLocalDatabase();
  if (!db) return null;

  const key = normalizeLatinName(latinName);
  if (!key) return null;

  const row = await db.getFirstAsync<WikiCacheRow>(
    `SELECT payload_json
     FROM wiki_cache
     WHERE latin_name_normalized = ?
     LIMIT 1`,
    key,
  );

  if (!row) return null;
  return parseWikiPayload(row.payload_json);
}

/** Persists a successful Wikipedia fetch so repeat identifies skip the network. */
export async function saveWikiCache(latinName: string, data: SpeciesWikiData): Promise<void> {
  const db = getLocalDatabase();
  if (!db) return;

  const trimmed = latinName.trim();
  const key = normalizeLatinName(trimmed);
  if (!key || !data.description.trim()) return;

  await db.runAsync(
    `INSERT INTO wiki_cache (latin_name_normalized, latin_name, payload_json, cached_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(latin_name_normalized) DO UPDATE SET
       latin_name = excluded.latin_name,
       payload_json = excluded.payload_json,
       cached_at = excluded.cached_at`,
    [key, trimmed, JSON.stringify(data), Date.now()],
  );
}
