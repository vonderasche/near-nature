import { useEffect, useState } from 'react';

import type { SpeciesWikiData } from '@/api/wikipedia';
import type { ClassificationResult, Species } from '@/types';
import type { TfliteIdentificationMeta } from '@/types/tfliteIdentification';

type IdentifyFn = (
  photoUri: string,
  userState: string,
  userId?: string,
) => Promise<{
  species: Species[];
  classifications: ClassificationResult[];
  wikiByLatinName: Record<string, SpeciesWikiData | null>;
  wikiError: string | null;
  tfliteMeta: TfliteIdentificationMeta | null;
}>;

export const emptyIdentificationResults = {
  species: [] as Species[],
  classifications: [] as ClassificationResult[],
  wikiByLatinName: {} as Record<string, SpeciesWikiData | null>,
  wikiError: null as string | null,
  tfliteMeta: null as TfliteIdentificationMeta | null,
};

/**
 * Runs vision identification when `photoUri` / `userState` / `identify` change. Skips until
 * `userState` is a real two-letter code (not the empty placeholder while the profile loads).
 * Wiki and iNaturalist enrichment run inside {@link IdentifyFn}.
 */
export function useIdentificationResultsState(
  photoUri: string | undefined,
  userState: string,
  userId: string | undefined,
  identify: IdentifyFn,
): {
  species: Species[];
  classifications: ClassificationResult[];
  wikiByLatinName: Record<string, SpeciesWikiData | null>;
  wikiError: string | null;
  tfliteMeta: TfliteIdentificationMeta | null;
} {
  const [species, setSpecies] = useState<Species[]>(emptyIdentificationResults.species);
  const [classifications, setClassifications] = useState<ClassificationResult[]>(
    emptyIdentificationResults.classifications,
  );
  const [wikiByLatinName, setWikiByLatinName] = useState<Record<string, SpeciesWikiData | null>>(
    emptyIdentificationResults.wikiByLatinName,
  );
  const [wikiError, setWikiError] = useState<string | null>(emptyIdentificationResults.wikiError);
  const [tfliteMeta, setTfliteMeta] = useState<TfliteIdentificationMeta | null>(
    emptyIdentificationResults.tfliteMeta,
  );

  useEffect(() => {
    if (!photoUri) {
      setSpecies(emptyIdentificationResults.species);
      setClassifications(emptyIdentificationResults.classifications);
      setWikiByLatinName(emptyIdentificationResults.wikiByLatinName);
      setWikiError(emptyIdentificationResults.wikiError);
      setTfliteMeta(emptyIdentificationResults.tfliteMeta);
      return;
    }
    if (userState.trim().length < 2) return;

    setSpecies(emptyIdentificationResults.species);
    setClassifications(emptyIdentificationResults.classifications);
    setWikiByLatinName(emptyIdentificationResults.wikiByLatinName);
    setWikiError(emptyIdentificationResults.wikiError);
    setTfliteMeta(emptyIdentificationResults.tfliteMeta);

    let cancelled = false;
    void (async () => {
      const results = await identify(photoUri, userState, userId);
      if (!cancelled) {
        setSpecies(results.species);
        setClassifications(results.classifications);
        setWikiByLatinName(results.wikiByLatinName);
        setWikiError(results.wikiError);
        setTfliteMeta(results.tfliteMeta);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photoUri, userState, userId, identify]);

  return { species, classifications, wikiByLatinName, wikiError, tfliteMeta };
}
