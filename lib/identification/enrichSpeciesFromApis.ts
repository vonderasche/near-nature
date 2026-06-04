import { lookupNativeStatus } from '@/api/inaturalist';
import { fetchSpeciesWikiData, type SpeciesWikiData } from '@/api/wikipedia';
import { getSpeciesSubcategoryLabel } from '@/constants/species-subcategories';
import { classificationToSpeciesCategory } from '@/lib/detections/mapSpeciesCategory';
import { speciesFromUnenrichedClassification } from '@/lib/identification/speciesFromClassification';
import { devLog } from '@/lib/devLog';
import { loadWikiCache, saveWikiCache } from '@/lib/db/wikiCacheRepository';
import { getSpeciesByScientificName } from '@/lib/db/speciesRepository';
import { normalizeLatinName } from '@/lib/identification/normalizeLatinName';
import {
  catalogFloridaStatusToSpeciesStatus,
  persistGenusEnrichmentToCatalog,
} from '@/lib/identification/persistGenusToCatalog';
import { wikiFromSavedDescription } from '@/lib/identification/wikiFromSavedDescription';
import { wikiFromSpeciesRecord } from '@/lib/identification/wikiFromSpeciesRecord';
import { resolveSavedSpeciesForLatinNames } from '@/lib/identification/savedSpeciesSessionCache';
import type { SavedSpeciesEnrichment } from '@/services/savedSpeciesEnrichmentService';
import type { ClassificationResult, Species, SpeciesStatus } from '@/types';

const DEFAULT_WIKI_SPECIES_LIMIT = 3;

/** Where wiki-style description text came from for one candidate. */
export type WikiEnrichmentSource = 'saved' | 'catalog' | 'wiki_cache' | 'wikipedia' | 'none';

/** Wikipedia by latin name; missing key = not fetched, null = no article. */
export type WikiByLatinName = Record<string, SpeciesWikiData | null>;

export type EnrichSpeciesFromApisOptions = {
  /** When set, reuses prior saved detection data instead of iNat/wiki when available. */
  userId?: string;
  wikiSpeciesLimit?: number;
  /**
   * Only run iNat + wiki enrichment for the first N candidates (others keep vision labels, status unknown).
   * Use 1 on the identification screen for faster results; cloud reclassify loads more when needed.
   */
  enrichDepthLimit?: number;
};

export type EnrichSpeciesFromApisResult = {
  species: Species[];
  wikiByLatinName: WikiByLatinName;
  wikiError: string | null;
  /** Stable id prefix for {@link Species.id} (`${speciesIdBase}-${index}`). */
  speciesIdBase: number;
};

export type EnrichClassificationIndicesResult = {
  speciesByIndex: Record<number, Species>;
  wikiByLatinName: WikiByLatinName;
  wikiError: string | null;
};

export { speciesFromUnenrichedClassification } from '@/lib/identification/speciesFromClassification';

async function fetchWikiForClassification(
  latinName: string,
  commonName: string,
): Promise<SpeciesWikiData | null> {
  const byLatin = await fetchSpeciesWikiData(latinName);
  if (byLatin) return byLatin;
  if (commonName) return fetchSpeciesWikiData(commonName);
  return null;
}

async function resolveNativeStatus(
  classification: ClassificationResult,
  userState: string,
  saved: SavedSpeciesEnrichment | undefined,
): Promise<SpeciesStatus> {
  if (saved && saved.status !== 'unknown') {
    return saved.status;
  }

  const catalogRecord = await getSpeciesByScientificName(classification.latinName);
  if (catalogRecord) {
    const fromCatalog = catalogFloridaStatusToSpeciesStatus(catalogRecord.floridaStatus);
    if (fromCatalog !== 'unknown') {
      return fromCatalog;
    }
  }

  const nativeResult = await lookupNativeStatus(classification.latinName, userState);
  const status = nativeResult?.status ?? saved?.status ?? 'unknown';

  if (nativeResult && status !== 'unknown') {
    void persistGenusEnrichmentToCatalog({
      latinName: classification.latinName,
      commonName: classification.commonName,
      status,
      inatTaxonId: nativeResult.taxonId,
    }).catch((error) => {
      devLog('[enrich] catalog status persist failed', { error });
    });
  }

  return status;
}

async function resolveWiki(
  classification: ClassificationResult,
  saved: SavedSpeciesEnrichment | undefined,
  onWikiError: (message: string) => void,
): Promise<{ wiki: SpeciesWikiData | null; source: WikiEnrichmentSource }> {
  const fromSaved = wikiFromSavedDescription(saved?.description, classification.latinName);
  if (fromSaved) return { wiki: fromSaved, source: 'saved' };

  const catalogRecord = await getSpeciesByScientificName(classification.latinName);
  const fromCatalog = catalogRecord ? wikiFromSpeciesRecord(catalogRecord) : null;
  if (fromCatalog) {
    devLog('[enrich] species catalog hit', { latinName: classification.latinName });
    return { wiki: fromCatalog, source: 'catalog' };
  }

  const fromCache = await loadWikiCache(classification.latinName);
  if (fromCache) {
    devLog('[enrich] wiki cache hit', { latinName: classification.latinName });
    return { wiki: fromCache, source: 'wiki_cache' };
  }

  try {
    const wiki = await fetchWikiForClassification(classification.latinName, classification.commonName);
    if (wiki) {
      void saveWikiCache(classification.latinName, wiki);
      void persistGenusEnrichmentToCatalog({
        latinName: classification.latinName,
        commonName: classification.commonName,
        wiki,
      }).catch((error) => {
        devLog('[enrich] catalog wiki persist failed', { error });
      });
    }
    return { wiki, source: wiki ? 'wikipedia' : 'none' };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Wikipedia request failed.';
    devLog('[enrich] wiki error', { latinName: classification.latinName, error: e });
    onWikiError(message);
    return { wiki: null, source: 'none' };
  }
}

type EnrichOneIndexResult = {
  species: Species;
  wiki: SpeciesWikiData | null;
  fetchWiki: boolean;
};

async function enrichOneClassificationIndex(
  classification: ClassificationResult,
  index: number,
  speciesIdBase: number,
  userState: string,
  saved: SavedSpeciesEnrichment | undefined,
  runFullEnrich: boolean,
  fetchWiki: boolean,
  onWikiError: (message: string) => void,
): Promise<EnrichOneIndexResult> {
  const statusPromise = runFullEnrich
    ? resolveNativeStatus(classification, userState, saved)
    : Promise.resolve(saved?.status ?? ('unknown' as SpeciesStatus));
  const wikiPromise = fetchWiki
    ? resolveWiki(classification, saved, onWikiError)
    : Promise.resolve({ wiki: null, source: 'none' as const });

  const [status, resolvedWiki] = await Promise.all([statusPromise, wikiPromise]);
  const category = classificationToSpeciesCategory(classification);

  return {
    species: {
      id: `${speciesIdBase}-${index}`,
      latinName: classification.latinName,
      commonName: classification.commonName,
      taxonGroup: getSpeciesSubcategoryLabel(category),
      status,
    },
    wiki: fetchWiki ? resolvedWiki.wiki : null,
    fetchWiki,
  };
}

/**
 * Enrich only the given candidate indices (e.g. alternates 1–2 after the top match).
 */
export async function enrichClassificationIndices(
  classifications: ClassificationResult[],
  userState: string,
  indices: readonly number[],
  options?: EnrichSpeciesFromApisOptions & { speciesIdBase?: number },
): Promise<EnrichClassificationIndicesResult> {
  const wikiSpeciesLimit = options?.wikiSpeciesLimit ?? DEFAULT_WIKI_SPECIES_LIMIT;
  const userId = options?.userId;
  const speciesIdBase = options?.speciesIdBase ?? Date.now();

  const uniqueIndices = [...new Set(indices)].filter(
    (index) => index >= 0 && index < classifications.length,
  );
  if (uniqueIndices.length === 0) {
    return { speciesByIndex: {}, wikiByLatinName: {}, wikiError: null };
  }

  devLog('[enrich] indices', {
    indices: uniqueIndices,
    wikiSpeciesLimit,
    userState,
    userId: userId ?? null,
  });

  const savedByLatin = userId
    ? await resolveSavedSpeciesForLatinNames(
        userId,
        classifications.map((c) => c.latinName),
      )
    : new Map<string, SavedSpeciesEnrichment>();

  let wikiError: string | null = null;
  const wikiByLatinName: WikiByLatinName = {};
  const speciesByIndex: Record<number, Species> = {};

  await Promise.all(
    uniqueIndices.map(async (index) => {
      const classification = classifications[index]!;
      const saved = savedByLatin.get(normalizeLatinName(classification.latinName));
      const fetchWiki = index < wikiSpeciesLimit && Boolean(classification.latinName);

      const { species, wiki, fetchWiki: didFetchWiki } = await enrichOneClassificationIndex(
        classification,
        index,
        speciesIdBase,
        userState,
        saved,
        true,
        fetchWiki,
        (message) => {
          if (!wikiError) wikiError = message;
        },
      );

      speciesByIndex[index] = species;
      if (didFetchWiki) {
        wikiByLatinName[classification.latinName] = wiki;
        devLog('[enrich] wiki item', {
          latinName: classification.latinName,
          hasData: Boolean(wiki),
          index,
        });
      }
    }),
  );

  return { speciesByIndex, wikiByLatinName, wikiError };
}

/**
 * After vision returns classifications, enrich each with iNaturalist status and (for the top
 * {@link wikiSpeciesLimit}) Wikipedia data. Local SQLite (saved species, genus catalog, wiki cache)
 * is checked first; network APIs run only on cache miss. Successful API results are written back
 * to SQLite for future identifications of the same genus.
 */
export async function enrichSpeciesFromApis(
  classifications: ClassificationResult[],
  userState: string,
  options?: EnrichSpeciesFromApisOptions,
): Promise<EnrichSpeciesFromApisResult> {
  const wikiSpeciesLimit = options?.wikiSpeciesLimit ?? DEFAULT_WIKI_SPECIES_LIMIT;
  const enrichDepthLimit = options?.enrichDepthLimit ?? classifications.length;
  const userId = options?.userId;

  if (classifications.length === 0) {
    return { species: [], wikiByLatinName: {}, wikiError: null, speciesIdBase: Date.now() };
  }

  devLog('[enrich] start', {
    count: classifications.length,
    wikiSpeciesLimit,
    enrichDepthLimit,
    userState,
    userId: userId ?? null,
  });

  const savedByLatin = userId
    ? await resolveSavedSpeciesForLatinNames(
        userId,
        classifications.map((c) => c.latinName),
      )
    : new Map<string, SavedSpeciesEnrichment>();

  let wikiError: string | null = null;
  const wikiByLatinName: WikiByLatinName = {};
  const speciesIdBase = Date.now();

  const species = await Promise.all(
    classifications.map(async (classification, index): Promise<Species> => {
      const saved = savedByLatin.get(normalizeLatinName(classification.latinName));
      const runFullEnrich = index < enrichDepthLimit;
      const fetchWiki =
        runFullEnrich && index < wikiSpeciesLimit && Boolean(classification.latinName);

      if (saved) {
        devLog('[enrich] saved detection hit', {
          latinName: classification.latinName,
          hasDescription: Boolean(saved.description),
          status: saved.status,
        });
      }

      const { species: row, wiki, fetchWiki: didFetchWiki } = await enrichOneClassificationIndex(
        classification,
        index,
        speciesIdBase,
        userState,
        saved,
        runFullEnrich,
        fetchWiki,
        (message) => {
          if (!wikiError) wikiError = message;
        },
      );

      if (didFetchWiki) {
        wikiByLatinName[classification.latinName] = wiki;
        devLog('[enrich] wiki item', {
          latinName: classification.latinName,
          hasData: Boolean(wiki),
          source: wiki ? 'fetched' : 'none',
        });
      }

      return row;
    }),
  );

  devLog('[enrich] done', {
    species: species.length,
    wikiKeys: Object.keys(wikiByLatinName),
    savedHits: savedByLatin.size,
  });
  return { species, wikiByLatinName, wikiError, speciesIdBase };
}
