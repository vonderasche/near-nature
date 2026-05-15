import { lookupNativeStatus } from '@/api/inaturalist';
import { fetchSpeciesWikiData, type SpeciesWikiData } from '@/api/wikipedia';
import { devLog } from '@/lib/devLog';
import type { ClassificationResult, Species } from '@/types';

const DEFAULT_WIKI_SPECIES_LIMIT = 3;

/** Wikipedia by latin name; missing key = not fetched, null = no article. */
export type WikiByLatinName = Record<string, SpeciesWikiData | null>;

export type EnrichSpeciesFromApisResult = {
  species: Species[];
  wikiByLatinName: WikiByLatinName;
  wikiError: string | null;
};

async function fetchWikiForClassification(
  latinName: string,
  commonName: string,
): Promise<SpeciesWikiData | null> {
  const [byLatin, byCommon] = await Promise.all([
    fetchSpeciesWikiData(latinName),
    commonName ? fetchSpeciesWikiData(commonName) : Promise.resolve(null),
  ]);
  return byLatin ?? byCommon;
}

/**
 * After vision returns classifications, enrich each with iNaturalist status and (for the top
 * {@link wikiSpeciesLimit}) Wikipedia data. Per species, iNat and wiki run in parallel; species
 * are processed concurrently.
 */
export async function enrichSpeciesFromApis(
  classifications: ClassificationResult[],
  userState: string,
  wikiSpeciesLimit = DEFAULT_WIKI_SPECIES_LIMIT,
): Promise<EnrichSpeciesFromApisResult> {
  if (classifications.length === 0) {
    return { species: [], wikiByLatinName: {}, wikiError: null };
  }

  devLog('[enrich] start', {
    count: classifications.length,
    wikiSpeciesLimit,
    userState,
  });

  let wikiError: string | null = null;
  const wikiByLatinName: WikiByLatinName = {};
  const baseId = Date.now();

  const species = await Promise.all(
    classifications.map(async (classification, index): Promise<Species> => {
      const fetchWiki = index < wikiSpeciesLimit && Boolean(classification.latinName);

      const [nativeResult, wiki] = await Promise.all([
        lookupNativeStatus(classification.latinName, userState),
        fetchWiki
          ? fetchWikiForClassification(classification.latinName, classification.commonName).catch(
              (e: unknown) => {
                const message = e instanceof Error ? e.message : 'Wikipedia request failed.';
                devLog('[enrich] wiki error', { latinName: classification.latinName, error: e });
                if (!wikiError) wikiError = message;
                return null;
              },
            )
          : Promise.resolve(null),
      ]);

      if (fetchWiki) {
        wikiByLatinName[classification.latinName] = wiki;
        devLog('[enrich] wiki item', {
          latinName: classification.latinName,
          hasData: Boolean(wiki),
        });
      }

      return {
        id: `${baseId}-${index}`,
        latinName: classification.latinName,
        commonName: classification.commonName,
        taxonGroup: classification.taxonGroup,
        status: nativeResult?.status ?? 'unknown',
      };
    }),
  );

  devLog('[enrich] done', { species: species.length, wikiKeys: Object.keys(wikiByLatinName) });
  return { species, wikiByLatinName, wikiError };
}
