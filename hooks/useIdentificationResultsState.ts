import { useCallback, useEffect, useRef, useState } from 'react';

import type { SpeciesWikiData } from '@/api/wikipedia';
import { identifyPhotoWithGemini } from '@/lib/identification/identifyPhotoWithGemini';
import { getGlobalClassificationDebugSession } from '@/lib/classification/debug';
import { devLog } from '@/lib/devLog';
import { proposeCloudCatalogFromGemini } from '@/lib/identification/proposeCloudCatalogIfMissing';
import { isCloudReclassifyAvailable } from '@/lib/identification/isCloudReclassifyAvailable';
import { enrichSpeciesFromApis } from '@/lib/identification/enrichSpeciesFromApis';
import { hasNoSpeciesFound } from '@/lib/image/imageFilters';
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
  reclassifyError: string | null;
  canReclassifyWithCloud: boolean;
  reclassifyWithCloud: () => Promise<void>;
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
  const [identifying, setIdentifying] = useState(false);
  const [alternatesEnriching, setAlternatesEnriching] = useState(false);
  const [reclassifyError, setReclassifyError] = useState<string | null>(null);
  const [cloudReclassifyReady, setCloudReclassifyReady] = useState(false);
  const [reclassifiedWithCloud, setReclassifiedWithCloud] = useState(false);
  const [speciesIdBase, setSpeciesIdBase] = useState(0);
  const speciesIdBaseRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (tfliteMeta == null || reclassifiedWithCloud) {
        setCloudReclassifyReady(false);
        return;
      }
      const available = await isCloudReclassifyAvailable();
      if (!cancelled) {
        setCloudReclassifyReady(available);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tfliteMeta, reclassifiedWithCloud]);

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
    setReclassifyError(null);
    setReclassifiedWithCloud(false);
    setCloudReclassifyReady(false);
    setSpeciesIdBase(0);

    setIdentifying(true);

    let cancelled = false;
    void (async () => {
      try {
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
      } finally {
        if (!cancelled) {
          setIdentifying(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photoUri, userState, userId, identify]);

  const reclassifyWithCloud = useCallback(async () => {
    if (!photoUri || userState.trim().length < 2 || reclassifiedWithCloud) {
      return;
    }

    setAlternatesEnriching(true);
    setReclassifyError(null);

    const priorTfliteMeta = tfliteMeta;
    const priorClassifications = classifications;

    try {
      const cloudClassifications = await identifyPhotoWithGemini(photoUri);

      if (hasNoSpeciesFound(cloudClassifications)) {
        getGlobalClassificationDebugSession()?.emit('cloud_reclassify', {
          priorTfliteMeta,
          priorClassifications,
          cloudClassifications: [],
          error: 'Cloud identification did not find a species in this photo.',
        });
        setReclassifyError('Cloud identification did not find a species in this photo.');
        return;
      }

      const { species: enrichedSpecies, wikiByLatinName: wiki, wikiError: enrichError, speciesIdBase: idBase } =
        await enrichSpeciesFromApis(cloudClassifications, userState, {
          userId,
          wikiSpeciesLimit: cloudClassifications.length,
          enrichDepthLimit: cloudClassifications.length,
        });

      getGlobalClassificationDebugSession()?.emit('cloud_reclassify', {
        priorTfliteMeta,
        priorClassifications,
        cloudClassifications,
      });

      speciesIdBaseRef.current = idBase;
      setSpeciesIdBase(idBase);
      setClassifications(cloudClassifications);
      setSpecies(enrichedSpecies);
      setWikiByLatinName(wiki);
      setWikiError(enrichError);
      setTfliteMeta(null);
      setReclassifiedWithCloud(true);

      void proposeCloudCatalogFromGemini(cloudClassifications, wiki).catch((error) => {
        devLog('[species_catalog] Gemini cloud save failed', error);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cloud identification failed';
      getGlobalClassificationDebugSession()?.emit('cloud_reclassify', {
        priorTfliteMeta,
        priorClassifications,
        cloudClassifications: [],
        error: message,
      });
      setReclassifyError(message);
    } finally {
      setAlternatesEnriching(false);
    }
  }, [classifications, photoUri, reclassifiedWithCloud, tfliteMeta, userId, userState]);

  const canReclassifyWithCloud =
    cloudReclassifyReady &&
    !reclassifiedWithCloud &&
    !identifying &&
    ((classifications.length > 0 && tfliteMeta != null) || classifications.length === 0);

  return {
    species,
    classifications,
    wikiByLatinName,
    wikiError,
    tfliteMeta,
    alternatesEnriching,
    reclassifyError,
    canReclassifyWithCloud,
    reclassifyWithCloud,
    speciesIdBase,
  };
}
