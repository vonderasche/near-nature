import type { SpeciesWikiData } from '@/api/wikipedia';
import { classificationToSpeciesCategory } from '@/lib/detections/mapSpeciesCategory';
import {
  addPendingGalleryDetection,
  createPendingGalleryDetectionId,
  removePendingGalleryDetection,
} from '@/lib/detections/pendingGalleryDetection';
import { resolveNaturalistCategoryFromClassification } from '@/lib/points/resolveNaturalistCategory';
import { getGlobalClassificationDebugSession } from '@/lib/classification/debug';
import { requestExplorerBoardRefresh } from '@/lib/explorerBoard/explorerBoardRefresh';
import { requestProfileRefresh } from '@/lib/profile/profileRefresh';
import { saveDetection } from '@/services/detectionService';
import type { ClassificationResult, Species } from '@/types';

export type SaveIdentificationInBackgroundInput = {
  userId: string;
  photoUri: string;
  userState: string;
  species: Species[];
  classifications: ClassificationResult[];
  wikiByLatinName: Record<string, SpeciesWikiData | null>;
  primaryIndex?: number;
  onError?: (message: string) => void;
  onComplete?: () => void;
};

/** Optimistic gallery tile + fire-and-forget upload (no navigation). */
export function saveIdentificationInBackground({
  userId,
  photoUri,
  userState,
  species,
  classifications,
  wikiByLatinName,
  primaryIndex = 0,
  onError,
  onComplete,
}: SaveIdentificationInBackgroundInput): void {
  if (classifications.length === 0) {
    onComplete?.();
    return;
  }

  const index = Math.min(Math.max(0, primaryIndex), classifications.length - 1);
  const primary = species[index];
  if (!primary) {
    onComplete?.();
    return;
  }

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

  void (async () => {
    try {
      const result = await saveDetection(input);
      removePendingGalleryDetection(pendingId, userId);
      getGlobalClassificationDebugSession()?.linkDetection(result.detectionId);
      getGlobalClassificationDebugSession()?.emit('save_linked', {
        detectionId: result.detectionId,
        selectedIndex: index,
      });
      requestProfileRefresh();
      if (result.newSpeciesDiscovery) {
        requestExplorerBoardRefresh();
      }
      onComplete?.();
    } catch (e) {
      removePendingGalleryDetection(pendingId, userId);
      const message = e instanceof Error ? e.message : 'Could not save identification.';
      onError?.(message);
      onComplete?.();
    }
  })();
}
