import { useCallback } from 'react';

import type { SpeciesWikiData } from '@/api/wikipedia';
import { saveIdentificationInBackground } from '@/lib/camera/saveIdentificationInBackground';
import { requestProfileRefresh } from '@/lib/profile/profileRefresh';
import type { ClassificationResult, Species } from '@/types';

export type SaveIdentificationInput = {
  species: Species[];
  classifications: ClassificationResult[];
  wikiByLatinName: Record<string, SpeciesWikiData | null>;
  /** Which candidate to save (default 0 = top match). */
  primaryIndex?: number;
};

type UseOptimisticIdentificationSaveOptions = {
  userId: string | undefined;
  photoUri: string;
  userState: string;
  onRetake: () => void;
  onBackgroundSaveError?: (message: string) => void;
  refetchHistory: () => Promise<void>;
};

export function useOptimisticIdentificationSave({
  userId,
  photoUri,
  userState,
  onRetake,
  onBackgroundSaveError,
  refetchHistory,
}: UseOptimisticIdentificationSaveOptions) {
  const saveIdentification = useCallback(
    ({ species, classifications, wikiByLatinName, primaryIndex = 0 }: SaveIdentificationInput) => {
      if (!userId || classifications.length === 0) return;

      onRetake();

      saveIdentificationInBackground({
        userId,
        photoUri,
        userState,
        species,
        classifications,
        wikiByLatinName,
        primaryIndex,
        onError: onBackgroundSaveError,
        onComplete: () => {
          void refetchHistory();
          requestProfileRefresh();
        },
      });
    },
    [onBackgroundSaveError, onRetake, photoUri, refetchHistory, userId, userState],
  );

  return { saveIdentification };
}
