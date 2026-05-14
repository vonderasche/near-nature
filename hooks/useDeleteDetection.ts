import { useCallback, useState } from 'react';

import { deleteSavedDetection } from '@/services/detectionService';
import { userFacingFromUnknown, userFacingOk, type UserFacingResult } from '@/types/user-facing-result';

export type DeleteDetectionResult = UserFacingResult;

/**
 * Deletes a saved detection for the signed-in user (RLS + storage cleanup in {@link deleteSavedDetection}).
 */
export function useDeleteDetection(): {
  deleteById: (detectionId: string) => Promise<DeleteDetectionResult>;
  deletingId: string | null;
} {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteById = useCallback(async (detectionId: string): Promise<DeleteDetectionResult> => {
    setDeletingId(detectionId);
    try {
      await deleteSavedDetection(detectionId);
      return userFacingOk();
    } catch (e) {
      return userFacingFromUnknown(e, 'Could not delete photo.');
    } finally {
      setDeletingId(null);
    }
  }, []);

  return { deleteById, deletingId };
}
