import { useCallback, useState } from 'react';

import { deleteSavedDetection } from '@/services/detectionService';

export type DeleteDetectionResult = { ok: true } | { ok: false; message: string };

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
      return { ok: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not delete photo.';
      return { ok: false, message };
    } finally {
      setDeletingId(null);
    }
  }, []);

  return { deleteById, deletingId };
}
