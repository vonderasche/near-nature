import { useCallback } from 'react';

import type { SpeciesWikiData } from '@/api/wikipedia';
import { classificationToSpeciesCategory } from '@/lib/detections/mapSpeciesCategory';
import {
  addPendingGalleryDetection,
  createPendingGalleryDetectionId,
  removePendingGalleryDetection,
} from '@/lib/detections/pendingGalleryDetection';
import { resolveNaturalistCategoryFromClassification } from '@/lib/points/resolveNaturalistCategory';
import { requestExplorerBoardRefresh } from '@/lib/explorerBoard/explorerBoardRefresh';
import { useSaveDetection } from '@/hooks/useSaveDetection';
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
  const { saveInBackground } = useSaveDetection();

  const saveIdentification = useCallback(
    ({ species, classifications, wikiByLatinName, primaryIndex = 0 }: SaveIdentificationInput) => {
      if (!userId || classifications.length === 0) return;

      const index = Math.min(Math.max(0, primaryIndex), classifications.length - 1);
      const primary = species[index];
      if (!primary) return;
      const wiki = wikiByLatinName[primary.latinName];
      const classification = classifications[index] ?? classifications[0];
      const naturalist = resolveNaturalistCategoryFromClassification(classification);
      const category = classificationToSpeciesCategory(classification);

      const input = {
        localImageUri: photoUri,
        userId,
        species: primary,
        classification,
        stateCode: userState,
        description: wiki?.description ?? null,
      };

      const pendingId = createPendingGalleryDetectionId();
      addPendingGalleryDetection(pendingId, {
        userId,
        localImageUri: photoUri,
        commonName: primary.commonName,
        latinName: primary.latinName,
        category,
        subcategory: naturalist?.subcategory ?? null,
        mainCategory: naturalist?.mainCategory ?? null,
        description: wiki?.description ?? null,
        nativeStatus: primary.status,
      });

      onRetake();

      saveInBackground(input, (result) => {
        removePendingGalleryDetection(pendingId, userId);
        if (!result.ok) {
          onBackgroundSaveError?.(result.message);
          return;
        }
        void refetchHistory();
        if (result.result.newSpeciesDiscovery) {
          requestExplorerBoardRefresh();
        }
      });
    },
    [
      onBackgroundSaveError,
      onRetake,
      photoUri,
      refetchHistory,
      saveInBackground,
      userId,
      userState,
    ],
  );

  return { saveIdentification };
}
