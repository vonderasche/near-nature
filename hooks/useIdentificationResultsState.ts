import { useCallback, useEffect, useRef, useState } from 'react';

import type { SpeciesWikiData } from '@/api/wikipedia';
import { enrichClassificationIndices } from '@/lib/identification/enrichSpeciesFromApis';
import { mergeIdentificationSpecies } from '@/lib/identification/mergeIdentificationSpecies';
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
  speciesIdBase: number;
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
  alternatesEnriching: boolean;
  enrichAlternates: () => Promise<void>;
  speciesIdBase: number;
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
  const [alternatesEnriching, setAlternatesEnriching] = useState(false);
  const [speciesIdBase, setSpeciesIdBase] = useState(0);
  const speciesIdBaseRef = useRef(0);
  const alternatesEnrichedRef = useRef(false);

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
    setAlternatesEnriching(false);
    setSpeciesIdBase(0);
    alternatesEnrichedRef.current = false;

    let cancelled = false;
    void (async () => {
      const results = await identify(photoUri, userState, userId);
      if (!cancelled) {
        speciesIdBaseRef.current = results.speciesIdBase;
        setSpeciesIdBase(results.speciesIdBase);
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

  const enrichAlternates = useCallback(async () => {
    if (classifications.length <= 1 || alternatesEnrichedRef.current) {
      return;
    }

    const indices = classifications.map((_, index) => index).filter((index) => index > 0);
    if (indices.length === 0) {
      return;
    }

    setAlternatesEnriching(true);
    try {
      const { speciesByIndex, wikiByLatinName: moreWiki, wikiError: moreWikiError } =
        await enrichClassificationIndices(classifications, userState, indices, {
          userId,
          wikiSpeciesLimit: classifications.length,
          speciesIdBase: speciesIdBaseRef.current,
        });

      alternatesEnrichedRef.current = true;
      setSpecies((current) =>
        mergeIdentificationSpecies(
          classifications,
          current,
          speciesByIndex,
          speciesIdBaseRef.current,
        ),
      );
      setWikiByLatinName((current) => ({ ...current, ...moreWiki }));
      if (moreWikiError) {
        setWikiError((current) => current ?? moreWikiError);
      }
    } finally {
      setAlternatesEnriching(false);
    }
  }, [classifications, userId, userState]);

  return {
    species,
    classifications,
    wikiByLatinName,
    wikiError,
    tfliteMeta,
    alternatesEnriching,
    enrichAlternates,
    speciesIdBase,
  };
}
