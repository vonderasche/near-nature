import { useCallback, useEffect, useRef, useState } from 'react';

import type { SpeciesWikiData } from '@/api/wikipedia';
import { fetchSpeciesWikiData } from '@/api/wikipedia';
import { devLog } from '@/lib/devLog';
import type { ClassificationResult, Species } from '@/types';

type IdentifyFn = (
  photoUri: string,
  userState: string,
) => Promise<{ species: Species[]; classifications: ClassificationResult[] }>;

/**
 * Runs vision identification when `photoUri` / `userState` / `identify` change, and loads Wikipedia
 * snippets for the top species. Keeps `refetch` off the identify effect deps via a ref so history
 * query identity changes (e.g. when `userId` loads) do not re-trigger vision.
 */
export function useIdentificationResultsState(
  photoUri: string | undefined,
  userState: string,
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
      const results = await identify(photoUri, userState);
      if (!cancelled) {
        setSpecies(results.species);
        setClassifications(results.classifications);
        refreshHistory();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photoUri, userState, identify, refreshHistory]);

  useEffect(() => {
    if (species.length === 0) return;
    let cancelled = false;

    (async () => {
      devLog('[results] wiki fetch begin', species.map((s) => s.latinName));
      const toFetch = species
        .slice(0, 3)
        .map((s) => ({ latinName: s.latinName, commonName: s.commonName }))
        .filter((s) => Boolean(s.latinName));
      const entries = await Promise.all(
        toFetch.map(async ({ latinName, commonName }) => {
          try {
            const data =
              (await fetchSpeciesWikiData(latinName)) ??
              (commonName ? await fetchSpeciesWikiData(commonName) : null);
            devLog('[results] wiki item', { latinName, commonName, hasData: Boolean(data) });
            return [latinName, data] as const;
          } catch (e: unknown) {
            devLog('[results] wiki item error', { latinName, error: e });
            setWikiError(e instanceof Error ? e.message : 'Wikipedia request failed.');
            return [latinName, null] as const;
          }
        })
      );

      if (cancelled) return;
      setWikiError(null);
      setWikiByLatinName((prev) => {
        const next = { ...prev };
        for (const [latinName, data] of entries) next[latinName] = data;
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [species]);

  return { species, classifications, wikiByLatinName, wikiError, refreshHistory };
}
