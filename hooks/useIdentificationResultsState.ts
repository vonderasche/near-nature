import { useCallback, useEffect, useRef, useState } from 'react';

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
 * enrichment run inside {@link IdentifyFn} (parallel after Claude). Keeps `refetch` off the identify
 * effect deps via a ref so history query identity changes do not re-trigger vision.
 */
export function useIdentificationResultsState(
  photoUri: string | undefined,
  userState: string,
  userId: string | undefined,
  identify: IdentifyFn,
  refetch: () => void,
): {
  species: Species[];
  classifications: ClassificationResult[];
  wikiByLatinName: Record<string, SpeciesWikiData | null>;
  wikiError: string | null;
  refreshHistory: () => void;
} {
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const refreshHistory = useCallback(() => {
    refetchRef.current();
  }, []);

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
        refreshHistory();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photoUri, userState, userId, identify, refreshHistory]);

  return { species, classifications, wikiByLatinName, wikiError, refreshHistory };
}
