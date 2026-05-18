import { normalizeLatinName } from '@/lib/identification/normalizeLatinName';
import {
  fetchAllSavedSpeciesEnrichment,
  fetchSavedSpeciesEnrichmentByLatinNames,
  type SavedSpeciesEnrichment,
} from '@/services/savedSpeciesEnrichmentService';

let sessionUserId: string | null = null;
let sessionMap: Map<string, SavedSpeciesEnrichment> | null = null;
let warmPromise: Promise<Map<string, SavedSpeciesEnrichment>> | null = null;

export function clearSavedSpeciesSession(): void {
  sessionUserId = null;
  sessionMap = null;
  warmPromise = null;
}

/** Loads latest detection metadata per latin name for the signed-in user (once per session). */
export async function warmSavedSpeciesSession(
  userId: string,
): Promise<Map<string, SavedSpeciesEnrichment>> {
  if (sessionUserId === userId && sessionMap) {
    return sessionMap;
  }
  if (warmPromise && sessionUserId === userId) {
    return warmPromise;
  }

  sessionUserId = userId;
  warmPromise = fetchAllSavedSpeciesEnrichment(userId)
    .then((map) => {
      sessionMap = map;
      return map;
    })
    .finally(() => {
      warmPromise = null;
    });

  return warmPromise;
}

export function upsertSavedSpeciesInSession(
  userId: string,
  enrichment: SavedSpeciesEnrichment,
): void {
  if (sessionUserId !== userId) return;
  if (!sessionMap) sessionMap = new Map();
  sessionMap.set(normalizeLatinName(enrichment.latinName), enrichment);
}

/**
 * Resolves saved species for identification enrichment: session map first, then targeted fetch.
 */
export async function resolveSavedSpeciesForLatinNames(
  userId: string,
  latinNames: readonly string[],
): Promise<Map<string, SavedSpeciesEnrichment>> {
  const wanted = latinNames.filter((n) => n.trim().length > 0);
  if (wanted.length === 0) return new Map();

  if (sessionUserId !== userId || !sessionMap) {
    try {
      await warmSavedSpeciesSession(userId);
    } catch {
      return fetchSavedSpeciesEnrichmentByLatinNames(userId, wanted);
    }
  }

  if (!sessionMap) {
    return fetchSavedSpeciesEnrichmentByLatinNames(userId, wanted);
  }

  const out = new Map<string, SavedSpeciesEnrichment>();
  const missing: string[] = [];

  for (const raw of wanted) {
    const key = normalizeLatinName(raw);
    const hit = sessionMap.get(key);
    if (hit) out.set(key, hit);
    else missing.push(raw);
  }

  if (missing.length === 0) return out;

  const fetched = await fetchSavedSpeciesEnrichmentByLatinNames(userId, missing);
  for (const [key, value] of fetched) {
    out.set(key, value);
    sessionMap.set(key, value);
  }

  return out;
}
