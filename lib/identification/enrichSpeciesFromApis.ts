import { lookupNativeStatus } from '@/api/inaturalist';
import { fetchSpeciesWikiData, type SpeciesWikiData } from '@/api/wikipedia';
import { getSpeciesSubcategoryLabel } from '@/constants/species-subcategories';
import { classificationToSpeciesCategory } from '@/lib/detections/mapSpeciesCategory';
import { devLog } from '@/lib/devLog';
import { normalizeLatinName } from '@/lib/identification/normalizeLatinName';
import { wikiFromSavedDescription } from '@/lib/identification/wikiFromSavedDescription';
import { wikiFromSpeciesRecord } from '@/lib/identification/wikiFromSpeciesRecord';
import { resolveSavedSpeciesForLatinNames } from '@/lib/identification/savedSpeciesSessionCache';
import { getSpeciesByScientificName } from '@/lib/db/speciesRepository';
import type { SavedSpeciesEnrichment } from '@/services/savedSpeciesEnrichmentService';
import type { ClassificationResult, Species, SpeciesStatus } from '@/types';

const DEFAULT_WIKI_SPECIES_LIMIT = 3;

/** Wikipedia by latin name; missing key = not fetched, null = no article. */
export type WikiByLatinName = Record<string, SpeciesWikiData | null>;

export type EnrichSpeciesFromApisOptions = {
  /** When set, reuses prior saved detection data instead of iNat/wiki when available. */
  userId?: string;
  wikiSpeciesLimit?: number;
};

export type EnrichSpeciesFromApisResult = {
  species: Species[];
  wikiByLatinName: WikiByLatinName;
  wikiError: string | null;
};

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
  const nativeResult = await lookupNativeStatus(classification.latinName, userState);
  return nativeResult?.status ?? saved?.status ?? 'unknown';
}

async function resolveWiki(
  classification: ClassificationResult,
  saved: SavedSpeciesEnrichment | undefined,
  onWikiError: (message: string) => void,
): Promise<SpeciesWikiData | null> {
  const fromSaved = wikiFromSavedDescription(saved?.description, classification.latinName);
  if (fromSaved) return fromSaved;

  const catalogRecord = await getSpeciesByScientificName(classification.latinName);
  const fromCatalog = catalogRecord ? wikiFromSpeciesRecord(catalogRecord) : null;
  if (fromCatalog) {
    devLog('[enrich] species catalog hit', { latinName: classification.latinName });
    return fromCatalog;
  }

  try {
    return await fetchWikiForClassification(classification.latinName, classification.commonName);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Wikipedia request failed.';
    devLog('[enrich] wiki error', { latinName: classification.latinName, error: e });
    onWikiError(message);
    return null;
  }
}

/**
 * After vision returns classifications, enrich each with iNaturalist status and (for the top
 * {@link wikiSpeciesLimit}) Wikipedia data. Per species, iNat and wiki run in parallel; species
 * are processed concurrently. Wikipedia tries the Latin name first, then the common name only if
 * Latin returns no usable article, to avoid duplicate network work when both resolve the same page.
 *
 * When {@link EnrichSpeciesFromApisOptions.userId} is set, species the user has saved before
 * reuse `detections` native status and description (no iNat/wiki calls when data is present).
 */
export async function enrichSpeciesFromApis(
  classifications: ClassificationResult[],
  userState: string,
  options?: EnrichSpeciesFromApisOptions,
): Promise<EnrichSpeciesFromApisResult> {
  const wikiSpeciesLimit = options?.wikiSpeciesLimit ?? DEFAULT_WIKI_SPECIES_LIMIT;
  const userId = options?.userId;

  if (classifications.length === 0) {
    return { species: [], wikiByLatinName: {}, wikiError: null };
  }

  devLog('[enrich] start', {
    count: classifications.length,
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
  const baseId = Date.now();

  const species = await Promise.all(
    classifications.map(async (classification, index): Promise<Species> => {
      const saved = savedByLatin.get(normalizeLatinName(classification.latinName));
      const fetchWiki = index < wikiSpeciesLimit && Boolean(classification.latinName);

      if (saved) {
        devLog('[enrich] saved detection hit', {
          latinName: classification.latinName,
          hasDescription: Boolean(saved.description),
          status: saved.status,
        });
      }

      const isPrimary = index === 0;
      const statusPromise = isPrimary
        ? resolveNativeStatus(classification, userState, saved)
        : Promise.resolve(saved?.status ?? ('unknown' as SpeciesStatus));
      const wikiPromise = fetchWiki
        ? resolveWiki(classification, saved, (message) => {
            if (!wikiError) wikiError = message;
          })
        : Promise.resolve(null);

      const [status, wiki] = await Promise.all([statusPromise, wikiPromise]);

      if (fetchWiki) {
        wikiByLatinName[classification.latinName] = wiki;
        devLog('[enrich] wiki item', {
          latinName: classification.latinName,
          hasData: Boolean(wiki),
          fromSaved: Boolean(saved?.description),
        });
      }

      const category = classificationToSpeciesCategory(classification);
      return {
        id: `${baseId}-${index}`,
        latinName: classification.latinName,
        commonName: classification.commonName,
        taxonGroup: getSpeciesSubcategoryLabel(category),
        status,
      };
    }),
  );

  devLog('[enrich] done', {
    species: species.length,
    wikiKeys: Object.keys(wikiByLatinName),
    savedHits: savedByLatin.size,
  });
  return { species, wikiByLatinName, wikiError };
}
