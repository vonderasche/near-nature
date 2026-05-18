import { useEffect, useState } from 'react';

import type { SpeciesWikiData } from '@/api/wikipedia';
import type { ClassificationResult, Species } from '@/types';

type IdentifyFn = (
  photoUri: string,
  userState: string,
  userId?: string,
) => Promise<{
  species: Species[];
  classifications: ClassificationResult[];
  wikiByLatinName: Record<string, SpeciesWikiData | null>;
  wikiError: string | null;
}>;

/**
 * Runs vision identification when `photoUri` / `userState` / `identify` change. Wiki and iNaturalist
 * enrichment run inside {@link IdentifyFn} (parallel after Claude).
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
} {
  const [species, setSpecies] = useState<Species[]>([]);
  const [classifications, setClassifications] = useState<ClassificationResult[]>([]);
  const [wikiByLatinName, setWikiByLatinName] = useState<Record<string, SpeciesWikiData | null>>({});
  const [wikiError, setWikiError] = useState<string | null>(null);

  useEffect(() => {
    if (!photoUri) return;
    let cancelled = false;
    (async () => {
      const results = await identify(photoUri, userState, userId);
      if (!cancelled) {
        setSpecies(results.species);
        setClassifications(results.classifications);
        setWikiByLatinName(results.wikiByLatinName);
        setWikiError(results.wikiError);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photoUri, userState, userId, identify]);

  return { species, classifications, wikiByLatinName, wikiError };
}
